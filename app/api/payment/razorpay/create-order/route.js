import { NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';

export async function POST(request) {
  try {
    const { amount, receiptId } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const order = await createRazorpayOrder(amount, receiptId);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
