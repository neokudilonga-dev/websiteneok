
import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getCachedPublishers } from '@/lib/admin-cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const publishers = await getCachedPublishers();
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

    if (!firestore) {
      return NextResponse.json({ message: 'Firestore not initialized' }, { status: 500 });
    }

    // Use publisher name as doc ID
    const docRef = firestore.collection('publishers').doc(name);
    await docRef.set({ name });

    revalidateTag('publishers');
    revalidateTag('shop');

    // Return the created publisher name to keep responses consistent
    return NextResponse.json({ name }, { status: 201 });
  } catch (error) {
    console.error('Error adding publisher:', error);
    return NextResponse.json({ message: 'Error adding publisher' }, { status: 500 });
  }
}
