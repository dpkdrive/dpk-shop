import { NextResponse } from 'next/server';
import { updateCategory, deleteCategory } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const updated = await updateCategory(id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    await deleteCategory(id);

    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 400 });
  }
}
