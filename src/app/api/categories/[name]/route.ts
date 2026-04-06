import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export const dynamic = "force-static";

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
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }
 
    if (!firestore) {
      return NextResponse.json({ message: 'Firestore not initialized' }, { status: 500 });
    }

    const categoryRef = firestore.collection('categories').doc(name);
    await categoryRef.delete();

    revalidateTag('categories');
    revalidateTag('shop');
 
    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ message: 'Error deleting category' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const incoming = await request.json();
    const nextName = incoming?.name;
    const nextType = incoming?.type === 'game' ? 'game' : 'book';
 
    if (!name) {
      return NextResponse.json({ message: 'Category id is required' }, { status: 400 });
    }
    if (!nextName || typeof nextName !== 'object' || !nextName.pt || !nextName.en) {
      return NextResponse.json({ message: 'Category name (pt/en) is required' }, { status: 400 });
    }
 
    if (!firestore) {
      return NextResponse.json({ message: 'Firestore not initialized' }, { status: 500 });
    }

    const currentRef = firestore.collection('categories').doc(name);
    const currentSnap = await currentRef.get();
    if (!currentSnap.exists) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }
 
    const newId = String(nextName.pt);
    if (newId === name) {
      await currentRef.set({ name: nextName, type: nextType }, { merge: true });
      revalidateTag('categories');
      revalidateTag('shop');
      return NextResponse.json({ id: name, name: nextName, type: nextType }, { status: 200 });
    }
 
    const newRef = firestore.collection('categories').doc(newId);
    const newSnap = await newRef.get();
    if (newSnap.exists) {
      return NextResponse.json({ message: 'Target category id already exists' }, { status: 409 });
    }
 
    await newRef.set({ name: nextName, type: nextType });
    await currentRef.delete();

    revalidateTag('categories');
    revalidateTag('shop');
 
    return NextResponse.json({ id: newId, name: nextName, type: nextType }, { status: 200 });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ message: 'Error updating category' }, { status: 500 });
  }
}
