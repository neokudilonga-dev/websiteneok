
import { Suspense } from 'react';
import Header from "@/components/header";
import { getCachedSchools, getCachedReadingPlan } from '@/lib/admin-cache';
import CheckoutPageContent from "./client-wrapper";

function CheckoutLoading() {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="font-headline text-xl text-muted-foreground">A carregar...</div>
        </div>
    )
}

export default async function CheckoutPage() {
  const [schools, readingPlan] = await Promise.all([
    getCachedSchools(),
    getCachedReadingPlan()
  ]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <Suspense fallback={<CheckoutLoading />}>
        <CheckoutPageContent 
          initialSchools={schools}
          initialReadingPlan={readingPlan}
        />
      </Suspense>
    </div>
  );
}
