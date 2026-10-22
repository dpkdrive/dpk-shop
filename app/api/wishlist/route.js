import { NextResponse } from 'next/server';
import { getWishlist, toggleWishlistItem } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ wishlist: [] });
    }

    const wishlist = await getWishlist(user.id);
    return NextResponse.json({ wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in to sync wishlist' }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const result = await toggleWishlistItem(user.id, productId);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error updating wishlist:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}
