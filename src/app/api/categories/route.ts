
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { Category } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body: Category = await request.json();
    if (!body.name || !body.type) {
        return NextResponse.json({ error: 'Category name and type are required' }, { status: 400 });
    }

    // Use name as the document ID for simplicity, assuming names are unique
    const categoryRef = firestore.collection('categories').doc(body.name);
    await categoryRef.set(body);

    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}
