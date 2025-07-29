
"use client";

import { useEffect, useState } from 'react';
import Header from "@/components/header";
import type { School, ReadingPlanItem } from "@/lib/types";
import CheckoutClient from "./client";
import { useData } from '@/context/data-context';

function CheckoutLoading() {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="font-headline text-xl text-muted-foreground">A carregar...</div>
        </div>
    )
}

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { setSchools, setReadingPlan } = useData();

  useEffect(() => {
    async function getCheckoutData() {
        try {
            setIsLoading(true);
            const [schoolsRes, readingPlanRes] = await Promise.all([
                fetch('/api/schools'),
                fetch('/api/reading-plan')
            ]);
            
            if (!schoolsRes.ok) throw new Error('Failed to fetch schools');
            if (!readingPlanRes.ok) throw new Error('Failed to fetch reading plan');

            const schoolsData = await schoolsRes.json();
            const readingPlanData = await readingPlanRes.json();

            // Populate the context
            setSchools(schoolsData);
            setReadingPlan(readingPlanData);
        } catch (error) {
            console.error("Error fetching checkout data:", error);
        } finally {
            setIsLoading(false);
        }
    }
    getCheckoutData();
  }, [setSchools, setReadingPlan]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      {isLoading ? (
          <CheckoutLoading />
      ) : (
          <CheckoutClient />
      )}
    </div>
  );
}
