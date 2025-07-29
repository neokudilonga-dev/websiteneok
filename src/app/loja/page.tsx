
"use client";

import { Suspense, useEffect, useState } from 'react';
import ShopPageContent from '@/components/shop-page-content';
import { useData } from '@/context/data-context';
import Header from '@/components/header';


function ShopPageLoading() {
    return (
        <div className="flex flex-1 items-center justify-center">
            <div className="font-headline text-xl text-muted-foreground">A carregar a loja...</div>
        </div>
    )
}

export default function LojaPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { setSchools, setProducts, setReadingPlan, setCategories } = useData();

  useEffect(() => {
    async function getShopData() {
      try {
        setIsLoading(true);
        const [schoolsRes, productsRes, readingPlanRes, categoriesRes] = await Promise.all([
            fetch('/api/schools'),
            fetch('/api/products'),
            fetch('/api/reading-plan'),
            fetch('/api/categories')
        ]);

        if (!schoolsRes.ok) throw new Error('Failed to fetch schools');
        if (!productsRes.ok) throw new Error('Failed to fetch products');
        if (!readingPlanRes.ok) throw new Error('Failed to fetch reading plan');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');

        const schoolsData = await schoolsRes.json();
        const productsData = await productsRes.json();
        const readingPlanData = await readingPlanRes.json();
        const categoriesData = await categoriesRes.json();
        
        // Populate the context with the fetched data
        setSchools(schoolsData);
        setProducts(productsData);
        setReadingPlan(readingPlanData);
        setCategories(categoriesData);

      } catch (error) {
          console.error("Error fetching shop data:", error);
      } finally {
          setIsLoading(false);
      }
    }
    getShopData();
  }, [setSchools, setProducts, setReadingPlan, setCategories]);

  return (
    <div className="flex min-h-screen w-full flex-col">
        <Header />
        <Suspense fallback={<ShopPageLoading />}>
        {isLoading ? (
            <ShopPageLoading />
        ) : (
            <ShopPageContent />
        )}
        </Suspense>
    </div>
  );
}
