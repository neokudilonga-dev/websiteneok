
import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ message: 'Publisher name is required' }, { status: 400 });
    }

    // Use publisher name as doc ID
    const docRef = firestore.collection('publishers').doc(name);
    await docRef.set({ name });

    return NextResponse.json({ message: 'Publisher added successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error adding publisher:', error);
    return NextResponse.json({ message: 'Error adding publisher' }, { status: 500 });
  }
}
