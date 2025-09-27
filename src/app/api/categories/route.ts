
import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const categoriesRef = firestore.collection('categories');
    const snapshot = await categoriesRef.get();
    const categories: { name: string; ptName: string }[] = [];
    snapshot.forEach(doc => {
      categories.push(doc.data() as { name: string; ptName: string });
    });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: 'Error fetching categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, ptName } = await request.json();

    if (!name || !ptName) {
      return NextResponse.json({ message: 'Category name and Portuguese name are required' }, { status: 400 });
    }

    // Use ptName as doc ID
    const docRef = firestore.collection('categories').doc(ptName);
    await docRef.set({ name, ptName });

    return NextResponse.json({ message: 'Category added successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json({ message: 'Error adding category' }, { status: 500 });
  }
}
