import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createRazorpayOrder, getRazorpayKeyId } from '@/lib/razorpay';
import { canUsePrisma } from '@/lib/db';

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (!(await canUsePrisma())) return NextResponse.json({ error: 'Payment service is temporarily unavailable.' }, { status: 503 });

    const { orderId } = await request.json();
    if (!orderId) return NextResponse.json({ error: 'Application order ID is required.' }, { status: 400 });
    const result = await prisma.$transaction(async (tx) => {
      // Return a Prisma-decodable scalar while acquiring the transaction-scoped lock.
      await tx.$queryRaw`WITH payment_lock AS (SELECT pg_advisory_xact_lock(hashtextextended(${orderId}, 0))) SELECT 1 AS locked`;
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { payments: true } });
      if (!order || order.userId !== user.id) return { error: 'Order not found.', status: 404 };
      if (order.paymentMethod !== 'RAZORPAY' || order.paymentStatus !== 'PENDING' || order.orderStatus === 'CANCELLED') {
        return { error: 'This order is not eligible for online payment.', status: 409 };
      }

      const existing = order.payments.find((payment) => payment.method === 'RAZORPAY' && payment.status === 'PENDING' && payment.razorpayOrderId);
      if (existing) {
        return { gatewayOrder: { id: existing.razorpayOrderId, amount: Math.round(Number(order.totalAmount) * 100), currency: existing.currency, key: getRazorpayKeyId() } };
      }

      const gatewayOrder = await createRazorpayOrder(Number(order.totalAmount), order.orderNumber);
      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          currency: gatewayOrder.currency,
          method: 'RAZORPAY',
          status: 'PENDING',
          razorpayOrderId: gatewayOrder.id,
        },
      });
      return { gatewayOrder };
    }, { timeout: 30000 });
    if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result.gatewayOrder);
  } catch (error) {
    console.error('Razorpay order creation failed:', {
      name: error.name,
      code: error.code,
      statusCode: error.statusCode,
      message: error.message,
    });
    return NextResponse.json({ error: 'Failed to initiate payment. Please try again.' }, { status: 500 });
  }
}
