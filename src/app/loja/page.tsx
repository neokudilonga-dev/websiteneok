
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { ShopPageContent } from '@/components/shop-page-content';
import Header from '@/components/header';
import { DataProvider } from '@/context/data-context';

// Avoid prerendering Loja at build time; fetch data on request.
export const dynamic = 'force-dynamic';

async function getShopData() {
  // Build absolute URLs using the current request headers to ensure
  // server-side fetch hits the correct origin in all environments.
  const hdrs = headers();
  const host = hdrs.get('x-forwarded-host') || hdrs.get('host') || '';
  const proto = hdrs.get('x-forwarded-proto') || 'https';
  const origin = host ? `${proto}://${host}` : '';
  const url = (path: string) => (origin ? `${origin}${path}` : path);

  // Fetch all resources in parallel, but do not fail the whole page
  // if one endpoint has an issue. Prefer fresh data without caching.
  const requests = [
    fetch(url('/api/schools'), { cache: 'no-store' }),
    fetch(url('/api/products'), { cache: 'no-store' }),
    fetch(url('/api/reading-plan'), { cache: 'no-store' }),
    fetch(url('/api/categories'), { cache: 'no-store' }),
  ];

  const [schoolsRes, productsRes, readingPlanRes, categoriesRes] = await Promise.allSettled(requests);

  const safeJson = async (res: Response | null, label: string) => {
    try {
      if (res && res.ok) return await res.json();
      const status = res ? res.status : 'no-response';
      console.warn(`[loja] ${label} fetch not ok`, status);
      return [];
    } catch (err) {
      console.error(`[loja] ${label} parse error`, err);
      return [];
    }
  };

  const schoolsData = await safeJson(
    schoolsRes.status === 'fulfilled' ? schoolsRes.value : null,
    'schools'
  );
  const productsData = await safeJson(
    productsRes.status === 'fulfilled' ? productsRes.value : null,
    'products'
  );
  const readingPlanData = await safeJson(
    readingPlanRes.status === 'fulfilled' ? readingPlanRes.value : null,
    'reading-plan'
  );
  const categoriesData = await safeJson(
    categoriesRes.status === 'fulfilled' ? categoriesRes.value : null,
    'categories'
  );

  return { schoolsData, productsData, readingPlanData, categoriesData };
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
