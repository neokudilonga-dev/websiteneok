
"use client";
import { ReactNode } from "react";
import { CartProvider } from "@/context/cart-context";
import { Toaster } from "@/components/ui/toaster";
import { WhatsAppButton } from "@/components/whatsapp-button";
import LoadingOverlay from "@/components/ui/loading-overlay";
import RouteLoadingHandler from "@/components/ui/route-loading-handler";
import { useGlobalLoading, DataProvider } from "@/context/data-context";
import { LanguageProvider } from "@/context/language-context";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { School, Product, ReadingPlanItem, Category } from "@/lib/types";

interface ProvidersProps {
  children: ReactNode;
  initialSchools: School[];
  initialProducts: Product[];
  initialReadingPlan: ReadingPlanItem[];
  initialCategories: Category[];
}

export default function Providers({
  children,
  initialSchools,
  initialProducts,
  initialReadingPlan,
  initialCategories,
}: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LanguageProvider>
        <DataProvider
          initialSchools={initialSchools}
          initialProducts={initialProducts}
          initialReadingPlan={initialReadingPlan}
          initialCategories={initialCategories}
        >
          <ProvidersContent>
            {children}
          </ProvidersContent>
        </DataProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

function ProvidersContent({ children }: { children: ReactNode }) {
  const loading = useGlobalLoading();
  return (
    <CartProvider>
      <RouteLoadingHandler />
      <Toaster />
      <WhatsAppButton />
      <LoadingOverlay show={loading} />
      {children}
    </CartProvider>
  );
}


