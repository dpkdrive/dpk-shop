import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/db';

export async function POST(request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Please enter a coupon code' }, { status: 400 });
    }

    const result = await validateCoupon(code, Number(subtotal || 0));
    if (!result.valid) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ valid: false, message: 'Failed to validate coupon' }, { status: 500 });
  }
}
