
import { Suspense } from 'react';
import { ShopPageContent } from '@/components/shop-page-content';
import Header from '@/components/header';
import { 
  getCachedProducts, 
  getCachedSchools, 
  getCachedReadingPlan, 
  getCachedCategories 
} from '@/lib/admin-cache';
import type { Category } from '@/lib/types';

function ShopPageLoading() {
    return (
        <div className="flex flex-1 items-center justify-center">
            <div className="font-headline text-xl text-muted-foreground">A carregar a loja...</div>
        </div>
    )
}

export default async function LojaPage() {
  const [products, schools, readingPlan, rawCategories] = await Promise.all([
    getCachedProducts(),
    getCachedSchools(),
    getCachedReadingPlan(),
    getCachedCategories()
  ]);

  const categories: Category[] = rawCategories.map(data => {
    const name = typeof data.name === 'object'
      ? data.name
      : { pt: (data as any).ptName || data.name || '', en: data.name || (data as any).ptName || '' };
    const type = data.type === 'game' ? 'game' : 'book';
    return { id: data.id, name, type } as Category;
  });

  return (
    <div className="flex min-h-screen w-full flex-col">
        <Header />
        <Suspense fallback={<ShopPageLoading />}>
            <ShopPageContent 
              initialSchools={schools}
              initialProducts={products}
              initialReadingPlan={readingPlan}
              initialCategories={categories}
            />
        </Suspense>
    </div>
  );
}

