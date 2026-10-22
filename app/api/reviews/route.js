import { NextResponse } from 'next/server';
import { addReview, getReviews } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') || undefined;
    const reviews = await getReviews(productId);
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    if (!body.productId || !body.rating || !body.comment) {
      return NextResponse.json(
        { error: 'Product, rating, and review comments are required' },
        { status: 400 }
      );
    }

    const review = await addReview({
      productId: body.productId,
      userName: user ? user.name : (body.userName || 'Verified Shopper'),
      userId: user ? user.id : null,
      rating: Number(body.rating),
      title: body.title || '',
      comment: body.comment,
      isVerified: Boolean(user),
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
