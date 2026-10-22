import { NextResponse } from 'next/server';
import { validateCoupon, getCoupons, createCoupon, deleteCoupon } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const coupons = await getCoupons();
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    if (!body.code || !body.discountValue) {
      return NextResponse.json({ error: 'Code and discount value required' }, { status: 400 });
    }

    const created = await createCoupon(body);
    return NextResponse.json({ success: true, coupon: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 });
    }

    await deleteCoupon(id);
    return NextResponse.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
