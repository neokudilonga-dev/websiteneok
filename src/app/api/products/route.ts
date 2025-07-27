
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { Product, ReadingPlanItem } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const productsCollection = firestore.collection('products');
    const snapshot = await productsCollection.get();
    
    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const products: Product[] = [];
    snapshot.forEach(doc => {
      products.push(doc.data() as Product);
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { product, readingPlan }: { product: Product, readingPlan: {schoolId: string, grade: number | string, status: 'mandatory' | 'recommended'}[] } = await request.json();
    
    const newId = uuidv4();
    const newProduct: Product = {
      ...product,
      id: newId,
    };
    
    const batch = firestore.batch();
    
    // Add the new product
    const productRef = firestore.collection('products').doc(newId);
    batch.set(productRef, newProduct);

    // Add reading plan items
    const readingPlanCollection = firestore.collection('readingPlan');
    readingPlan.forEach(item => {
        const newPlanItemRef = readingPlanCollection.doc(uuidv4());
        const newPlanItem: ReadingPlanItem = {
            id: newPlanItemRef.id,
            productId: newId,
            ...item,
        };
        batch.set(newPlanItemRef, newPlanItem);
    });

    await batch.commit();

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
