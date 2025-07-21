"use client";

import { useState } from "react";
import type { School, Product } from "@/lib/types";
import { schools, products as allProducts } from "@/lib/data";
import Header from "@/components/header";
import ProductGrid from "@/components/product-grid";

export default function Home() {
  const [selectedSchool, setSelectedSchool] = useState<School | undefined>(
    schools[0]
  );

  const handleSchoolChange = (schoolId: string) => {
    const school = schools.find((s) => s.id === schoolId);
    setSelectedSchool(school);
  };

  const filteredProducts = selectedSchool
    ? allProducts.filter((p) => p.schoolId === selectedSchool.id)
    : allProducts;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header
        schools={schools}
        selectedSchool={selectedSchool}
        onSchoolChange={handleSchoolChange}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            {selectedSchool
              ? `Showing items for ${selectedSchool.name}`
              : "All Items"}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Explore our curated selection of books and games.
          </p>
        </div>
        <ProductGrid products={filteredProducts} />
      </main>
    </div>
  );
}
