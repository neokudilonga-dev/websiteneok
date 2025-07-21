
"use client";

import { useState } from "react";
import type { School, Product } from "@/lib/types";
import { schools, products as allProducts } from "@/lib/data";
import Header from "@/components/header";
import ProductGrid from "@/components/product-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SchoolSelector from "@/components/school-selector";

export default function Home() {
  const [selectedSchool, setSelectedSchool] = useState<School | undefined>(
    schools[0]
  );
  const [activeTab, setActiveTab] = useState("planos");

  const handleSchoolChange = (schoolId: string) => {
    const school = schools.find((s) => s.id === schoolId);
    setSelectedSchool(school);
  };

  const schoolProducts = selectedSchool
    ? allProducts.filter((p) => p.schoolId === selectedSchool.id)
    : [];

  const allBooks = allProducts.filter((p) => p.type === "book");
  const allGames = allProducts.filter((p) => p.type === "game");

  const renderTitle = () => {
    switch (activeTab) {
      case "planos":
        return selectedSchool
          ? `Plano de Leitura: ${selectedSchool.name}`
          : "Selecione uma escola";
      case "catalogo":
        return "Catálogo Completo de Livros";
      case "jogos":
        return "Jogos e Outros Itens";
      default:
        return "BiblioAngola";
    }
  };

   const renderDescription = () => {
    switch (activeTab) {
      case 'planos':
        return 'Selecione a escola para ver os livros e jogos recomendados.';
      case 'catalogo':
        return 'Explore todos os livros disponíveis no nosso catálogo.';
      case 'jogos':
        return 'Descubra a nossa seleção de jogos educativos e outros itens.';
      default:
        return 'Sua fonte de livros e jogos escolares.';
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <Tabs defaultValue="planos" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
              <TabsTrigger value="planos">Planos de Leitura</TabsTrigger>
              <TabsTrigger value="catalogo">Catálogo Completo</TabsTrigger>
              <TabsTrigger value="jogos">Jogos e Outros</TabsTrigger>
            </TabsList>

             <div className="mt-6">
                <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                    {renderTitle()}
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    {renderDescription()}
                </p>
             </div>

            <TabsContent value="planos" className="mt-6">
                <div className="mb-6">
                    <SchoolSelector
                        schools={schools}
                        selectedSchool={selectedSchool}
                        onSchoolChange={handleSchoolChange}
                    />
                </div>
                {selectedSchool ? <ProductGrid products={schoolProducts} /> : (
                     <div className="mx-auto flex max-w-7xl flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
                        <h3 className="font-headline text-2xl font-semibold tracking-tight">Selecione uma escola</h3>
                        <p className="text-muted-foreground">Por favor, selecione uma escola para ver a lista de materiais.</p>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="catalogo" className="mt-6">
              <ProductGrid products={allBooks} />
            </TabsContent>

            <TabsContent value="jogos" className="mt-6">
              <ProductGrid products={allGames} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
