
import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import type { Category } from '@/lib/types';
import { revalidateTag } from 'next/cache';
import { getCachedCategories } from '@/lib/admin-cache';

export const dynamic = "force-static";

export async function GET() {
  try {
    const categories = await getCachedCategories();
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: 'Error fetching categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const incoming = await request.json();
    const category = incoming as Partial<Category>;

    if (!category?.name || typeof category.name !== 'object' || !category.name.pt || !category.name.en) {
      return NextResponse.json({ message: 'Category name (pt/en) is required' }, { status: 400 });
    }
    const type: 'book' | 'game' = category.type === 'game' ? 'game' : 'book';

    if (!firestore) {
      return NextResponse.json({ message: 'Firestore not initialized' }, { status: 500 });
    }

    // Use Portuguese name as the document ID to align with existing deletion route
    const docId = category.id && category.id.length > 0 ? category.id : category.name.pt;
    const docRef = firestore.collection('categories').doc(docId);
    await docRef.set({
      name: category.name,
      type,
    });

    revalidateTag('categories');
    revalidateTag('shop');

    return NextResponse.json({ id: docId, name: category.name, type }, { status: 201 });
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json({ message: 'Error adding category' }, { status: 500 });
  }
}
