

import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    if (!name) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const categoryRef = firestore.collection('categories').doc(name);
    await categoryRef.delete();

    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ message: 'Error deleting category' }, { status: 500 });
  }
}
