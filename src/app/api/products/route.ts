import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { Product, ReadingPlanItem } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const productsRef = firestore.collection('products');
    const snapshot = await productsRef.get();
    const products: Product[] = [];
    snapshot.forEach(doc => {
      products.push(doc.data() as Product);
    });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Error fetching products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product: Product = body.product;
    const incomingReadingPlan: ReadingPlanItem[] = Array.isArray(body.readingPlan)
      ? body.readingPlan
      : (product?.readingPlan || []);

    if (!product || !product.name || !product.category || !product.price || !product.image || (Array.isArray(product.image) ? product.image.length === 0 : !product.image)) {
      return NextResponse.json({ message: 'Missing required product fields' }, { status: 400 });
    }

    // Generate a new UUID for the product
    const productId = uuidv4();
    product.id = productId;

    // Persist reading plan entries if provided
    if (incomingReadingPlan && incomingReadingPlan.length > 0) {
      const batch = firestore.batch();
      incomingReadingPlan.forEach((plan: ReadingPlanItem) => {
        const planId = plan.id || uuidv4();
        const planRef = firestore.collection('readingPlan').doc(planId);
        batch.set(planRef, { ...plan, id: planId, productId: productId });
      });
      await batch.commit();
    }

    // Save product to Firestore
    const docRef = firestore.collection('products').doc(productId);
    await docRef.set(product);

    return NextResponse.json({ message: 'Product created', productId: productId }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ message: 'Error creating product' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

