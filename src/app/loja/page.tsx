
import { Suspense } from 'react';
import { ShopPageContent } from '@/components/shop-page-content';
import Header from '@/components/header';
import { DataProvider } from '@/context/data-context';

// Avoid prerendering Loja at build time; fetch data on request.
export const dynamic = 'force-dynamic';

async function getShopData() {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || '';
    const url = (path: string) => (base ? `${base}${path}` : path);
    const [schoolsRes, productsRes, readingPlanRes, categoriesRes] = await Promise.all([
        fetch(url('/api/schools'), { next: { revalidate: 60 } }),
        fetch(url('/api/products'), { next: { revalidate: 60 } }),
        fetch(url('/api/reading-plan'), { next: { revalidate: 60 } }),
        fetch(url('/api/categories'), { next: { revalidate: 60 } })
    ]);

    if (!schoolsRes.ok) throw new Error('Failed to fetch schools');
    if (!productsRes.ok) throw new Error('Failed to fetch products');
    if (!readingPlanRes.ok) throw new Error('Failed to fetch reading plan');
    if (!categoriesRes.ok) throw new Error('Failed to fetch categories');

    const schoolsData = await schoolsRes.json();
    const productsData = await productsRes.json();
    const readingPlanData = await readingPlanRes.json();
    const categoriesData = await categoriesRes.json();
    
    return { schoolsData, productsData, readingPlanData, categoriesData };

  } catch (error) {
      console.error("Error fetching shop data:", error);
      return { schoolsData: [], productsData: [], readingPlanData: [], categoriesData: [] };
  }
}

function ShopPageLoading() {
    return (
        <div className="flex flex-1 items-center justify-center">
            <div className="font-headline text-xl text-muted-foreground">A carregar a loja...</div>
        </div>
    )
}

export default async function LojaPage() {
  const { schoolsData, productsData, readingPlanData, categoriesData } = await getShopData();

  return (
    <div className="flex min-h-screen w-full flex-col">
        <Header />
        <Suspense fallback={<ShopPageLoading />}>
            <DataProvider initialSchools={schoolsData} initialProducts={productsData} initialReadingPlan={readingPlanData} initialCategories={categoriesData}>
                <ShopPageContent 
                  initialSchools={schoolsData}
                  initialProducts={productsData}
                  initialReadingPlan={readingPlanData}
                  initialCategories={categoriesData}
                />
            </DataProvider>
        </Suspense>
    </div>
  );
}
