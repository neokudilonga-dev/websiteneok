
"use client";

import { useEffect, Suspense } from 'react';
import Header from "@/components/header";
import CheckoutClient from "./client";
import { useData } from '@/context/data-context';

function CheckoutLoading() {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="font-headline text-xl text-muted-foreground">A carregar...</div>
        </div>
    )
}

function CheckoutContent() {
  const { setSchools, setReadingPlan } = useData();

  useEffect(() => {
    async function getCheckoutData() {
        try {
            const [schoolsRes, readingPlanRes] = await Promise.all([
                fetch('/api/schools'),
                fetch('/api/reading-plan')
            ]);
            
            if (!schoolsRes.ok) throw new Error('Failed to fetch schools');
            if (!readingPlanRes.ok) throw new Error('Failed to fetch reading plan');

            const schoolsData = await schoolsRes.json();
            const readingPlanData = await readingPlanRes.json();

            setSchools(schoolsData);
            setReadingPlan(readingPlanData);
        } catch (error) {
            console.error("Error fetching checkout data:", error);
        }
    }
    getCheckoutData();
  }, [setSchools, setReadingPlan]);
  
  return <CheckoutClient />;
}

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <Suspense fallback={<CheckoutLoading />}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
