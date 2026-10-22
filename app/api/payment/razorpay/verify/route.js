import { NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { updateOrderStatus } from '@/lib/db';

export async function POST(request) {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = await request.json();

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        { error: 'Missing payment verification credentials' },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature. Payment verification failed.' },
        { status: 400 }
      );
    }

    // Update order payment status
    if (orderId) {
      await updateOrderStatus(orderId, {
        paymentStatus: 'PAID',
        paymentMethod: 'RAZORPAY',
        paymentDetails: {
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
          verifiedAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpayPaymentId,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
