import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { canUsePrisma } from '@/lib/db';
import { getRazorpayClient, verifyRazorpaySignature } from '@/lib/razorpay';

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (!(await canUsePrisma())) return NextResponse.json({ error: 'Payment service is temporarily unavailable.' }, { status: 503 });

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request.json();
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: 'Missing payment verification credentials.' }, { status: 400 });
    }
    if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      return NextResponse.json({ error: 'Invalid payment signature. Payment verification failed.' }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({ where: { razorpayOrderId }, include: { order: true } });
    if (!payment || payment.orderId !== orderId || payment.order.userId !== user.id || payment.method !== 'RAZORPAY') {
      return NextResponse.json({ error: 'Payment does not belong to this customer order.' }, { status: 403 });
    }
    if (payment.razorpayPaymentId === razorpayPaymentId && payment.status === 'PAID' && payment.order.paymentStatus === 'PAID') {
      return NextResponse.json({ success: true, message: 'Payment already verified.', paymentId: razorpayPaymentId });
    }
    if (payment.status !== 'PENDING' || payment.order.paymentStatus !== 'PENDING') {
      return NextResponse.json({ error: 'This order is not awaiting payment.' }, { status: 409 });
    }

    const gatewayPayment = await getRazorpayClient().payments.fetch(razorpayPaymentId);
    if (gatewayPayment.order_id !== razorpayOrderId || gatewayPayment.status !== 'captured' || gatewayPayment.currency !== payment.currency || gatewayPayment.amount !== Math.round(Number(payment.amount) * 100) || gatewayPayment.amount !== Math.round(Number(payment.order.totalAmount) * 100)) {
      return NextResponse.json({ error: 'Payment is not captured or does not match the order amount.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id: orderId, userId: user.id, paymentStatus: 'PENDING', paymentMethod: 'RAZORPAY' },
        data: { paymentStatus: 'PAID', orderStatus: 'CONFIRMED' },
      });
      if (claimed.count === 0) {
        const fresh = await tx.order.findUnique({ where: { id: orderId } });
        const alreadyRecorded = await tx.payment.findUnique({ where: { id: payment.id } });
        if (fresh?.paymentStatus !== 'PAID' || alreadyRecorded?.razorpayPaymentId !== razorpayPaymentId || alreadyRecorded.status !== 'PAID') {
          throw new Error('Order payment state changed; retry verification.');
        }
        return;
      }
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID', razorpayPaymentId, razorpaySignature },
      });
    });

    return NextResponse.json({ success: true, message: 'Payment verified successfully.', paymentId: razorpayPaymentId });
  } catch (error) {
    console.error('Payment verification failed:', error.message);
    return NextResponse.json({ error: 'Payment verification failed. Please contact support if your account was charged.' }, { status: 500 });
  }
}
