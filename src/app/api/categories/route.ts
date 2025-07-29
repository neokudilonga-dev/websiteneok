
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { Category } from '@/lib/types';

export async function GET() {
    try {
        const categoriesCollection = firestore.collection('categories');
        const snapshot = await categoriesCollection.get();
        const categories: Category[] = [];
        snapshot.forEach(doc => {
            categories.push(doc.data() as Category);
        });
        return NextResponse.json(categories, { status: 200 });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

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
