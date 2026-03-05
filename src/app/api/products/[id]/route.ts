
import { firestore, auth } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { Product, ReadingPlanItem } from '@/lib/types';
import { deleteImageFromFirebase } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid'
import { revalidateTag } from 'next/cache';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedProduct: Product = body.product;

    if (!id) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    const productRef = firestore.collection('products').doc(id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Update reading plans if provided
    if (updatedProduct?.readingPlan) {
      console.log(`[PUT /api/products/${id}] Processing reading plan updates. Count: ${updatedProduct.readingPlan.length}`);
      const batch = firestore.batch();
      
      // 1. Get existing reading plan items for this product
      const existingRPQuery = await firestore.collection('readingPlan')
        .where('productId', '==', id)
        .get();
      
      const existingRPIds = existingRPQuery.docs.map(doc => doc.id);
      const incomingRPIds = updatedProduct.readingPlan
        .map(plan => plan.id)
        .filter((id): id is string => !!id);

      // 2. Delete items that are no longer in the incoming list
      const idsToDelete = existingRPIds.filter(id => !incomingRPIds.includes(id));
      console.log(`[PUT /api/products/${id}] Deleting ${idsToDelete.length} removed reading plan items`);
      idsToDelete.forEach(idToDelete => {
        batch.delete(firestore.collection('readingPlan').doc(idToDelete));
      });

      // 3. Upsert incoming items
      updatedProduct.readingPlan.forEach((plan: ReadingPlanItem) => {
        const planId = plan.id || uuidv4();
        const planRef = firestore.collection('readingPlan').doc(planId);
        // Ensure we don't include the ID in the document data if we want Firestore to use the doc ID
        const { id: _, ...planData } = plan;
        batch.set(planRef, { ...planData, id: planId, productId: id }, { merge: true });
      });
      
      await batch.commit();
      console.log(`[PUT /api/products/${id}] Reading plan batch commit successful`);
    }

    // Build update object, excluding undefined fields
    const updateData: any = {};
    const allowedFields = [
      'name', 
      'description', 
      'price', 
      'stock', 
      'type', 
      'stockStatus', 
      'image', 
      'dataAiHint', 
      'category', 
      'publisher', 
      'author', 
      'status',
      'storagePlace'
    ];

    allowedFields.forEach(field => {
      if ((updatedProduct as any)[field] !== undefined) {
        updateData[field] = (updatedProduct as any)[field];
      }
    });

    console.log(`[PUT /api/products/${id}] Final update data:`, JSON.stringify(updateData));

    if (Object.keys(updateData).length > 0) {
      await productRef.update(updateData);
    }

    revalidateTag('products');
    revalidateTag('reading-plan');
    revalidateTag('shop');

    return NextResponse.json({ message: 'Product updated successfully' }, { status: 200 });
  } catch (error) {
    console.error(`[PUT /api/products] Error updating product:`, error);
    return NextResponse.json({ 
      message: 'Error updating product', 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Enforce owner-only permission for deleting products
    const sessionCookie = request.cookies.get('session')?.value || '';
    if (!sessionCookie) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const email = (decoded as any).email || '';
    if (email !== 'neokudilonga@gmail.com') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    const productRef = firestore.collection('products').doc(id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const productData = productDoc.data() as Product;

    // Delete associated images from storage (Firebase)
    if (productData.image) {
      const imagesToDelete = Array.isArray(productData.image) ? productData.image : [productData.image];
      for (const imageSrc of imagesToDelete) {
        // Delete from Firebase Storage if applicable
        await deleteImageFromFirebase(imageSrc);
      }
    }

    await productRef.delete();

    revalidateTag('products');
    revalidateTag('reading-plan');
    revalidateTag('shop');

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Error deleting product' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
