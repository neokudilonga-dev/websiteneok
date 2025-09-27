import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import type { Product, ReadingPlanItem } from '@/lib/types';
import { ProductSchema, ReadingPlanItemSchema } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const productsCollection = firestore.collection('products');
        const snapshot = await productsCollection.get();
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
    const body = await request.json();
    console.log("Incoming product data:", JSON.stringify(body));
    const { product, readingPlan } = body;

    // Validate product
    const productResult = ProductSchema.safeParse(product);
    if (!productResult.success) {
      console.error("Product validation error:", productResult.error); // Add more logging
      return NextResponse.json({
        error: 'Invalid product data',
        details: productResult.error.flatten().fieldErrors
      }, { status: 400 });
    }

    // Validate readingPlan
    if (!Array.isArray(readingPlan)) {
      console.error("readingPlan is not an array:", readingPlan); // Add more logging
      return NextResponse.json({
        error: 'Invalid readingPlan data',
        details: 'readingPlan must be an array'
      }, { status: 400 });
    }
    for (const item of readingPlan) {
      const planResult = ReadingPlanItemSchema.safeParse(item);
      if (!planResult.success) {
        console.error("ReadingPlanItem validation error:", planResult.error); // Add more logging
        return NextResponse.json({
          error: 'Invalid readingPlan item',
          details: planResult.error.flatten().fieldErrors
        }, { status: 400 });
      }
    }

    // If product.image is too large, throw a specific error
    if (product.image && typeof product.image === 'string' && product.image.length > 1048487) {
      console.error("Product image too large:", product.image.length); // Add more logging
      return NextResponse.json({
        error: 'Product image is too large. Please upload images to Firebase Storage and use a URL instead.'
      }, { status: 400 });
    }

    const newProduct: Product = {
      ...productResult.data, // Use validated data
      id: productResult.data.name ?? '', // Use user-provided name as ID, with fallback
      name: productResult.data.name, // Ensure name field also stores the user-provided name
    };

    const batch = firestore.batch();

    // Add the new product
    const productRef = firestore.collection('products').doc(newProduct.id); // Use newProduct.id as document ID
    batch.set(productRef, newProduct);

    // Add reading plan items
    const readingPlanCollection = firestore.collection('readingPlan');
    readingPlan.forEach((item: any) => {
        const newPlanItemRef = readingPlanCollection.doc(uuidv4());
        const newPlanItem: ReadingPlanItem = {
            id: newPlanItemRef.id,
            productId: newProduct.id, // Use newProduct.id as productId
            ...item,
        };
        batch.set(newPlanItemRef, newPlanItem);
    });

    try {
    await batch.commit();
    } catch (batchError: any) {
      console.error("Batch commit error:", batchError);
      return NextResponse.json({ error: 'Failed to commit batch', details: batchError.message }, { status: 500 });
  }

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('Error adding product:', error);
    return NextResponse.json({ error: 'Failed to add product', details: error.message }, { status: 500 });
}
}

