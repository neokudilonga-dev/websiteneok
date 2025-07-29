
import { Suspense } from 'react';
import ShopPageContent from '@/components/shop-page-content';
import { firestore } from '@/lib/firebase-admin';
import type { School, Product, ReadingPlanItem, Category } from '@/lib/types';


async function getShopData() {
    const schoolsCollection = firestore.collection('schools');
    const schoolsSnapshot = await schoolsCollection.get();
    const schools = schoolsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));

    const productsCollection = firestore.collection('products');
    const productsSnapshot = await productsCollection.get();
    const products = productsSnapshot.docs.map(doc => doc.data() as Product);
    
    const readingPlanCollection = firestore.collection('readingPlan');
    const readingPlanSnapshot = await readingPlanCollection.get();
    const readingPlan = readingPlanSnapshot.docs.map(doc => doc.data() as ReadingPlanItem);

    const categoriesCollection = firestore.collection('categories');
    const categoriesSnapshot = await categoriesCollection.get();
    const categories = categoriesSnapshot.docs.map(doc => doc.data() as Category);

    return { schools, products, readingPlan, categories };
}

function ShopPageLoading() {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="font-headline text-xl text-muted-foreground">A carregar a loja...</div>
        </div>
    )
}

export default async function LojaPage() {
  const { schools, products, readingPlan, categories } = await getShopData();

  return (
    <Suspense fallback={<ShopPageLoading />}>
      <ShopPageContent 
        schools={schools} 
        products={products} 
        readingPlan={readingPlan} 
        categories={categories} 
      />
    </Suspense>
  );
}
