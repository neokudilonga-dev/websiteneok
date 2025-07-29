
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { name }: { name: string } = await request.json();
    if (!name) {
        return NextResponse.json({ error: 'Publisher name is required' }, { status: 400 });
    }

    const publisherRef = firestore.collection('publishers').doc(name);
    // We can set an empty object, we only care about the document ID (the name)
    await publisherRef.set({});

    return NextResponse.json({ name }, { status: 201 });
  } catch (error) {
    console.error('Error adding publisher:', error);
    return NextResponse.json({ error: 'Failed to add publisher' }, { status: 500 });
  }
}
