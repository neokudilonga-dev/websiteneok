import { NextResponse } from 'next/server';
import { getCachedProducts, getCachedSchools, getCachedCategories } from '@/lib/admin-cache';

export async function GET() {
  try {
    console.log('[DEBUG] Testing public data fetch...');
    
    const [products, schools, categories] = await Promise.all([
      getCachedProducts(),
      getCachedSchools(),
      getCachedCategories()
    ]);
    
    console.log(`[DEBUG] Products: ${products.length}, Schools: ${schools.length}, Categories: ${categories.length}`);
    
    return NextResponse.json({
      success: true,
      products: products.length,
      schools: schools.length,
      categories: categories.length,
      sampleProduct: products[0] || null,
      sampleCategory: categories[0] || null
    });
  } catch (error: any) {
    console.error('[DEBUG] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
