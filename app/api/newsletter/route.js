import { NextResponse } from 'next/server';
import { subscribeNewsletter } from '@/lib/db';

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    await subscribeNewsletter(email);
    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing to DPK Shop exclusive offers!',
    });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
