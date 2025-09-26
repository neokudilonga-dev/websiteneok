
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { Product, ReadingPlanItem } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { deleteImageFromFirebase } from '@/lib/firebase';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { product, readingPlan }: { product: Product, readingPlan: {schoolId: string, grade: number | string, status: 'mandatory' | 'recommended'}[] } = await request.json();
    
    const productRef = firestore.collection('products').doc(id);
    
    // Remove undefined values to prevent Firestore errors
    const updateData: any = { ...product };
    Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
            delete updateData[key];
        }
    });
    // updateData.name = id; // Reverted: name should be user-provided
    
    await productRef.update(updateData);

    // Handle reading plan updates
    const readingPlanCollection = firestore.collection('readingPlan');
    const batch = firestore.batch();

    // 1. Delete existing reading plan items for this product
    const existingPlanSnapshot = await readingPlanCollection.where('productId', '==', id).get();
    existingPlanSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    // 2. Add new reading plan items
    readingPlan.forEach(item => {
        const newPlanItemRef = readingPlanCollection.doc(uuidv4());
        const newPlanItem: ReadingPlanItem = {
            id: newPlanItemRef.id,
            productId: id,
            ...item
        };
        batch.set(newPlanItemRef, newPlanItem);
    });

    await batch.commit();

    return NextResponse.json({ ...product }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { imageUrl } = await request.json();

    if (imageUrl) {
      await deleteImageFromFirebase(imageUrl);
    }

    const productRef = firestore.collection('products').doc(id);
    await productRef.delete();

    // Delete associated reading plan items
    const readingPlanCollection = firestore.collection('readingPlan');
    const existingPlanSnapshot = await readingPlanCollection.where('productId', '==', id).get();
    const batch = firestore.batch();
    existingPlanSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    return NextResponse.json({ message: 'Product and associated reading plan items deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
