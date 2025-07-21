
"use client";

import { useState, useMemo } from "react";
import type { School, Product } from "@/lib/types";
import { schools, products as allProducts } from "@/lib/data";
import Header from "@/components/header";
import ProductGrid from "@/components/product-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SchoolSelector from "@/components/school-selector";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";

export default function Home() {
  const [selectedSchool, setSelectedSchool] = useState<School | undefined>(
    schools[0]
  );
  const [activeTab, setActiveTab] = useState("planos");
  const [showIndividual, setShowIndividual] = useState<string | null>(null);
  const { addKitToCart } = useCart();

  const handleSchoolChange = (schoolId: string) => {
    const school = schools.find((s) => s.id === schoolId);
    setSelectedSchool(school);
    setShowIndividual(null); // Reset when school changes
  };

  const schoolProducts = useMemo(() => selectedSchool
    ? allProducts.filter((p) => p.schoolId === selectedSchool.id)
    : [], [selectedSchool]);

  const productsByGrade = useMemo(() => {
    const grades: { [key: number]: Product[] } = {};
    schoolProducts.forEach(product => {
      if (product.type === 'book' && product.grade) {
        if (!grades[product.grade]) {
          grades[product.grade] = [];
        }
        grades[product.grade].push(product);
      }
    });
    return grades;
  }, [schoolProducts]);

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
        return 'Selecione a escola para ver os livros recomendados por ano escolar.';
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
                {selectedSchool ? (
                   Object.keys(productsByGrade).length > 0 ? (
                    <Accordion type="single" collapsible className="w-full" defaultValue={`item-${Object.keys(productsByGrade)[0]}`} onValueChange={() => setShowIndividual(null)}>
                      {Object.entries(productsByGrade).sort(([a], [b]) => Number(a) - Number(b)).map(([grade, products]) => (
                        <AccordionItem value={`item-${grade}`} key={grade}>
                          <AccordionTrigger className="text-xl font-semibold">
                            {`${grade}º Ano`}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-6">
                                <div className="rounded-lg border bg-card p-6">
                                    <h3 className="font-headline text-2xl font-semibold">Kit Completo do {grade}º Ano</h3>
                                    <p className="mt-2 text-muted-foreground">Compre todos os livros para o ano letivo com um único clique.</p>
                                    <Button size="lg" className="mt-4" onClick={() => addKitToCart(products)}>
                                        <ShoppingCart className="mr-2 h-5 w-5" /> Adicionar Kit Completo ao Carrinho
                                    </Button>
                                </div>

                                {showIndividual === grade ? (
                                    <ProductGrid products={products} />
                                ) : (
                                    <div className="text-center">
                                        <Button variant="outline" onClick={() => setShowIndividual(grade)}>
                                            Comprar em separado
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                   ) : (
                     <div className="mx-auto flex max-w-7xl flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
                        <h3 className="font-headline text-2xl font-semibold tracking-tight">Nenhum livro encontrado</h3>
                        <p className="text-muted-foreground">Não há livros do plano de leitura para esta escola ainda.</p>
                    </div>
                   )
                ) : (
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
