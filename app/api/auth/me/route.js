import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { findUserById } from '@/lib/db';

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ user: null });
    }

    const fullUser = await findUserById(sessionUser.id);
    if (!fullUser) {
      return NextResponse.json({ user: null });
    }

    const safeUser = {
      id: fullUser.id,
      name: fullUser.name,
      email: fullUser.email,
      role: fullUser.role,
      phone: fullUser.phone || null,
      addresses: fullUser.addresses || [],
    };

    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ user: null });
  }
}
