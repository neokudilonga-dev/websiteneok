
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const publishersCollection = firestore.collection('publishers');
    const snapshot = await publishersCollection.get();
    
    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const publishers: string[] = [];
    snapshot.forEach(doc => {
      publishers.push(doc.id); // The publisher name is the document ID
    });

    return NextResponse.json(publishers.sort(), { status: 200 });
  } catch (error) {
    console.error('Error fetching publishers:', error);
    return NextResponse.json({ error: 'Failed to fetch publishers' }, { status: 500 });
  }
}

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
