import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/types';
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
    const product: Product = await request.json();

    if (!product.name || !product.category || !product.publisher || !product.price || !product.images || product.images.length === 0) {
      return NextResponse.json({ message: 'Missing required product fields' }, { status: 400 });
    }

    // Validate image sizes
    for (const image of product.images) {
      if (image.width > 1000 || image.height > 1000) {
        return NextResponse.json({ message: 'Image dimensions cannot exceed 1000x1000 pixels' }, { status: 400 });
      }
    }

    // Generate a new UUID for the product
    const productId = uuidv4();
    product.id = productId;

    // Add reading plans if they exist
    if (product.readingPlans && product.readingPlans.length > 0) {
      const batch = firestore.batch();
      product.readingPlans.forEach((plan: ReadingPlanItem) => {
        const planRef = firestore.collection('readingPlans').doc(plan.id);
        batch.set(planRef, plan);
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

