import { NextResponse } from 'next/server';
import { getAdminMetrics } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const metrics = await getAdminMetrics();
    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch admin metrics' }, { status: 500 });
  }
}
