import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return [];
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;

    if (!name) {
      return NextResponse.json({ message: 'Publisher name is required' }, { status: 400 });
    }

    if (!firestore) {
      return NextResponse.json({ message: 'Firestore not initialized' }, { status: 500 });
    }

    const publisherRef = firestore.collection('publishers').doc(name);
    await publisherRef.delete();

    revalidateTag('publishers');
    revalidateTag('shop');

    return NextResponse.json({ message: 'Publisher deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting publisher:', error);
    return NextResponse.json({ message: 'Error deleting publisher' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const body = await request.json();
    const nextName = String(body?.name || '').trim();
 
    if (!name) {
      return NextResponse.json({ message: 'Publisher id is required' }, { status: 400 });
    }
    if (!nextName) {
      return NextResponse.json({ message: 'New publisher name is required' }, { status: 400 });
    }
 
    if (!firestore) {
      return NextResponse.json({ message: 'Firestore not initialized' }, { status: 500 });
    }

    if (nextName === name) {
      await firestore.collection('publishers').doc(name).set({ name: nextName }, { merge: true });
      revalidateTag('publishers');
      revalidateTag('shop');
      return NextResponse.json({ name }, { status: 200 });
    }
 
    const targetRef = firestore.collection('publishers').doc(nextName);
    const targetSnap = await targetRef.get();
    if (targetSnap.exists) {
      return NextResponse.json({ message: 'Target publisher already exists' }, { status: 409 });
    }
 
    const currentRef = firestore.collection('publishers').doc(name);
    const currentSnap = await currentRef.get();
    if (!currentSnap.exists) {
      return NextResponse.json({ message: 'Publisher not found' }, { status: 404 });
    }
 
    await targetRef.set({ name: nextName });
    await currentRef.delete();

    revalidateTag('publishers');
    revalidateTag('shop');

    return NextResponse.json({ name: nextName }, { status: 200 });
  } catch (error) {
    console.error('Error updating publisher:', error);
    return NextResponse.json({ message: 'Error updating publisher' }, { status: 500 });
  }
}
