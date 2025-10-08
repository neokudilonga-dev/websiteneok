
import type { Metadata } from "next";
import "./globals.css";

import Providers from "@/components/ui/providers";
import { School, Product, ReadingPlanItem, Category } from "@/lib/types";

export const metadata: Metadata = {
  title: "Neokudilonga",
  description: "A sua fonte de livros e jogos escolares.",
};

// Mark root layout dynamic to avoid prerendering issues in build pipelines
// when fetching data from internal route handlers.
export const dynamic = 'force-dynamic';

async function getInitialData(): Promise<{
  initialSchools: School[];
  initialProducts: Product[];
  initialReadingPlan: ReadingPlanItem[];
  initialCategories: Category[];
}> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || '';
    const url = (path: string) => (base ? `${base}${path}` : path);
    const [schoolsRes, productsRes, readingPlanRes, categoriesRes] = await Promise.all([
      fetch(url('/api/schools'), { next: { revalidate: 60 } }),
      fetch(url('/api/products'), { next: { revalidate: 60 } }),
      fetch(url('/api/reading-plan'), { next: { revalidate: 60 } }),
      fetch(url('/api/categories'), { next: { revalidate: 60 } }),
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { initialSchools, initialProducts, initialReadingPlan, initialCategories } = await getInitialData();

  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <Providers
          initialSchools={initialSchools}
          initialProducts={initialProducts}
          initialReadingPlan={initialReadingPlan}
          initialCategories={initialCategories}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
