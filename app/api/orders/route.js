import { NextResponse } from 'next/server';
import { canUsePrisma, createOrder, getOrderById, getOrders } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    // If admin, can view all orders. If customer, only view their own orders.
    const queryOptions = user.role === 'ADMIN' ? { status } : { userId: user.id, status };
    const orders = await getOrders(queryOptions);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    if (body.paymentMethod === 'RAZORPAY' && !user) {
      return NextResponse.json({ error: 'Sign in before placing an online payment order.' }, { status: 401 });
    }
    if (body.paymentMethod === 'RAZORPAY' && !(await canUsePrisma())) {
      return NextResponse.json({ error: 'Online payment is temporarily unavailable. Please try again later.' }, { status: 503 });
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!body.customerName || !body.customerEmail || !body.customerPhone) {
      return NextResponse.json({ error: 'Customer contact details are required' }, { status: 400 });
    }

    if (!body.shippingStreet || !body.shippingCity || !body.shippingPincode) {
      return NextResponse.json({ error: 'Complete shipping address is required' }, { status: 400 });
    }

    if (body.existingOrderId) {
      if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      const existingOrder = await getOrderById(body.existingOrderId);
      if (!existingOrder || existingOrder.userId !== user.id || existingOrder.paymentMethod !== 'RAZORPAY' || existingOrder.paymentStatus !== 'PENDING') {
        return NextResponse.json({ error: 'Pending order is no longer eligible for payment.' }, { status: 409 });
      }
      return NextResponse.json({ success: true, order: existingOrder });
    }

    const orderPayload = {
      ...body,
      userId: user ? user.id : null,
    };

    const order = await createOrder(orderPayload);
    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to place order' }, { status: 400 });
  }
}
