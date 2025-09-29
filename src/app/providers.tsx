import { ReactNode } from "react";
import { DataProvider } from "@/context/data-context";
import { LanguageProvider } from "@/context/language-context";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { School, Product, ReadingPlanItem, Category } from "@/lib/types";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function getInitialData(): Promise<{
  initialSchools: School[];
  initialProducts: Product[];
  initialReadingPlan: ReadingPlanItem[];
  initialCategories: Category[];
}> {
  try {
    const [schoolsRes, productsRes, readingPlanRes, categoriesRes] = await Promise.all([
      fetch(`${baseUrl}/api/schools`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/products`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/reading-plan`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/categories`, { cache: 'no-store' }),
    ]);

    const initialSchools = schoolsRes.ok ? await schoolsRes.json() : [];
    const initialProducts = productsRes.ok ? await productsRes.json() : [];
    const initialReadingPlan = readingPlanRes.ok ? await readingPlanRes.json() : [];
    const initialCategories = categoriesRes.ok ? await categoriesRes.json() : [];

    return { initialSchools, initialProducts, initialReadingPlan, initialCategories };
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
    return {
      initialSchools: [],
      initialProducts: [],
      initialReadingPlan: [],
      initialCategories: [],
    };
  }
}

export async function Providers({ children }: { children: ReactNode }) {
  const { initialSchools, initialProducts, initialReadingPlan, initialCategories } = await getInitialData();

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
          {children}
        </DataProvider>
      </LanguageProvider>
      <Toaster />
    </ThemeProvider>
  );
}