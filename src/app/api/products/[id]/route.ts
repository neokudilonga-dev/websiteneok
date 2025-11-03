
import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { Product, ReadingPlanItem } from '@/lib/types';
import { deleteImageFromFirebase } from '@/lib/firebase';
import { deleteImageFromR2 } from '@/lib/r2';
import { v4 as uuidv4 } from 'uuid'

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
    if (updatedProduct?.readingPlan && updatedProduct.readingPlan.length > 0) {
      const batch = firestore.batch();
      updatedProduct.readingPlan.forEach((plan: ReadingPlanItem) => {
        const planId = plan.id || uuidv4();
        const planRef = firestore.collection('readingPlan').doc(planId);
        batch.set(planRef, { ...plan, id: planId, productId: id });
      });
      await batch.commit();
    }

    await productRef.update({
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      stock: updatedProduct.stock,
      type: updatedProduct.type,
      dataAiHint: updatedProduct.dataAiHint,
      category: updatedProduct.category,
      publisher: updatedProduct.publisher,
      stockStatus: updatedProduct.stockStatus,
      status: updatedProduct.status,
      image: updatedProduct.image,
    });

    return NextResponse.json({ message: 'Product updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Error updating product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Delete associated images from storage (Firebase and R2)
    if (productData.image) {
      const imagesToDelete = Array.isArray(productData.image) ? productData.image : [productData.image];
      for (const imageSrc of imagesToDelete) {
        // Try Firebase first; it will no-op for non-Firebase URLs
        await deleteImageFromFirebase(imageSrc);
        // Then try R2; it will no-op for non-R2 URLs or missing envs
        await deleteImageFromR2(imageSrc);
      }
    }

    await productRef.delete();

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Error deleting product' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
