import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getProducts, createProduct } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const options = {
      categorySlug: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      sortBy: searchParams.get('sort') || 'newest',
      inStockOnly: searchParams.get('inStock') === 'true',
      featuredOnly: searchParams.get('featured') === 'true',
      trendingOnly: searchParams.get('trending') === 'true',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 12,
    };

    const data = await getProducts(options);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve products' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required. Please log in as admin.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body.name || !body.price || !body.categoryId) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const created = await createProduct(body);

    try {
      revalidatePath('/admin/products');
      revalidatePath('/products');
      revalidatePath('/');
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
