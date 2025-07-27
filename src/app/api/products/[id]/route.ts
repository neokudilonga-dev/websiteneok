
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { Product, ReadingPlanItem } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { product, readingPlan }: { product: Product, readingPlan: {schoolId: string, grade: number | string, status: 'mandatory' | 'recommended'}[] } = await request.json();
    
    const productRef = firestore.collection('products').doc(id);
    await productRef.update({
        ...product,
        // Firestore handles nested objects, so we can pass them directly
        name: { pt: product.name.pt, en: product.name.en },
        description: { pt: product.description.pt, en: product.description.en },
    });

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

    return NextResponse.json({ id, ...product }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        const batch = firestore.batch();
        
        // Delete product
        const productRef = firestore.collection('products').doc(id);
        batch.delete(productRef);
        
        // Delete associated reading plan items
        const readingPlanQuery = firestore.collection('readingPlan').where('productId', '==', id);
        const readingPlanSnapshot = await readingPlanQuery.get();
        readingPlanSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();

        return NextResponse.json({ message: 'Product and associated items deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
