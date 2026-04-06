import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';

export const dynamic = "force-static";

export async function GET() {
  try {
    console.log('[TEST] Testing Firestore connection...');

    if (!firestore) {
      return NextResponse.json({ 
        success: false, 
        error: 'Firestore not initialized'
      }, { status: 500 });
    }

    // Test basic connection
    const snapshot = await firestore.collection('products').limit(1).get();
    console.log(`[TEST] Firestore query returned ${snapshot.size} documents`);
    
    if (snapshot.empty) {
      // Try to get count
      const allSnapshot = await firestore.collection('products').get();
      console.log(`[TEST] Total products in collection: ${allSnapshot.size}`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Connected but no products found',
        totalProducts: allSnapshot.size,
        sample: null
      });
    }
    
    const sample = snapshot.docs[0]?.data();
    console.log('[TEST] Sample product:', JSON.stringify(sample, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Firestore connection working',
      totalProducts: snapshot.size,
      sample: sample
    });
  } catch (error: any) {
    console.error('[TEST] Firestore test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
