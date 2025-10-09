
import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snapshot = await firestore.collection('publishers').get();
    const publishers: string[] = [];

    snapshot.forEach((doc) => {
      // We use the publisher name as the document ID when inserting.
      // Returning doc.id ensures consistent string[] shape for the UI.
      publishers.push(doc.id);
    });

    return NextResponse.json(publishers, { status: 200 });
  } catch (error) {
    console.error('Error fetching publishers:', error);
    return NextResponse.json(
      { message: 'Error fetching publishers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ message: 'Publisher name is required' }, { status: 400 });
    }

    // Use publisher name as doc ID
    const docRef = firestore.collection('publishers').doc(name);
    await docRef.set({ name });

    // Return the created publisher name to keep responses consistent
    return NextResponse.json({ name }, { status: 201 });
  } catch (error) {
    console.error('Error adding publisher:', error);
    return NextResponse.json({ message: 'Error adding publisher' }, { status: 500 });
  }
}
