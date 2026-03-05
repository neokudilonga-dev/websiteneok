import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { Product, ReadingPlanItem } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { revalidateTag } from 'next/cache';
import { getCachedProducts } from '@/lib/admin-cache';

export async function GET() {
  try {
    const products = await getCachedProducts();
    // Client-facing filtering: exclude sold_out and omit publisher
    const filteredProducts = products
      .filter(p => p.stockStatus !== 'sold_out')
      .map((product) => {
        const { publisher, ...rest } = product;
        return rest;
      });
      
    return NextResponse.json(filteredProducts, { status: 200 });
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

    if (!product || !product.name || !product.price || !product.image || (Array.isArray(product.image) ? product.image.length === 0 : !product.image)) {
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

    // Clean up product object to remove undefined fields and potential recursive references
    const productData: any = {};
    const allowedFields = [
      'name', 
      'description', 
      'price', 
      'stock', 
      'type', 
      'category', 
      'publisher', 
      'author', 
      'image', 
      'status', 
      'stockStatus', 
      'dataAiHint',
      'storagePlace'
    ];
    
    allowedFields.forEach(field => {
      if ((product as any)[field] !== undefined) {
        productData[field] = (product as any)[field];
      }
    });

    productData.id = productId;
    console.log(`[POST /api/products] Final product data:`, JSON.stringify(productData));

    // Save product to Firestore
    const docRef = firestore.collection('products').doc(productId);
    await docRef.set(productData);

    revalidateTag('products');
    revalidateTag('reading-plan');
    revalidateTag('shop');

    return NextResponse.json({ message: 'Product created', productId: productId }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/products] Error creating product:', error);
    return NextResponse.json({ 
      message: 'Error creating product', 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

