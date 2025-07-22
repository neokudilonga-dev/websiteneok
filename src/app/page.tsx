
"use client";

import { useState, useMemo } from "react";
import type { School, Product, ReadingPlanItem } from "@/lib/types";
import { schools, products as allProducts, readingPlan, bookCategories } from "@/lib/data";
import Header from "@/components/header";
import ProductGrid from "@/components/product-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SchoolSelector from "@/components/school-selector";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ShoppingCart, Search } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/product-card";


interface GradeProducts {
  mandatory: Product[];
  recommended: Product[];
  all: Product[];
}

export default function Home() {
  const [selectedSchool, setSelectedSchool] = useState<School | undefined>(
    schools[0]
  );
  const [activeTab, setActiveTab] = useState("planos");
  const [showIndividual, setShowIndividual] = useState<string | null>(null);
  const { addKitToCart } = useCart();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleSchoolChange = (schoolId: string) => {
    const school = schools.find((s) => s.id === schoolId);
    setSelectedSchool(school);
    setShowIndividual(null); // Reset when school changes
  };
  
  const productsById = useMemo(() => {
    return allProducts.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {} as Record<string, Product>);
  }, []);

  const schoolReadingPlan = useMemo(() => selectedSchool
    ? readingPlan.filter((item) => item.schoolId === selectedSchool.id)
    : [], [selectedSchool]);

  const productsByGrade = useMemo(() => {
    const grades: { [key: number]: GradeProducts } = {};
    schoolReadingPlan.forEach(item => {
      const product = productsById[item.productId];
      if (product && product.stockStatus !== 'sold_out') {
         if (!grades[item.grade]) {
          grades[item.grade] = { mandatory: [], recommended: [], all: [] };
        }
        if (item.status === 'mandatory') {
            grades[item.grade].mandatory.push(product);
        } else {
            grades[item.grade].recommended.push(product);
        }
        grades[item.grade].all.push(product);
      }
    });
    return grades;
  }, [schoolReadingPlan, productsById]);
  
  const allGames = allProducts.filter((p) => p.type === "game" && p.stockStatus !== 'sold_out');

  const filteredBooks = useMemo(() => {
    return allProducts.filter(p => 
        p.type === 'book' && 
        p.stockStatus !== 'sold_out' &&
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedCategory === 'all' || p.category === selectedCategory)
    )
  }, [searchQuery, selectedCategory]);


  const renderTitle = () => {
    switch (activeTab) {
      case "planos":
        return selectedSchool
          ? `Plano de Leitura: ${selectedSchool.name}`
          : "Selecione uma escola";
      case "catalogo":
        return "Todos os Livros";
      case "jogos":
        return "Jogos e Outros Itens";
      default:
        return "Neokudilonga";
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
        return 'A sua fonte de livros e jogos escolares.';
    }
  };

  const renderProductGridWithBadges = (products: Product[], grade: string) => {
    const gradePlan = schoolReadingPlan.filter(p => p.grade === Number(grade));

    return (
      <ProductGrid products={products} renderBadge={(product) => {
        const planItem = gradePlan.find(gp => gp.productId === product.id);
        if (planItem) {
          return (
            <Badge
              variant={planItem.status === 'mandatory' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {planItem.status === 'mandatory' ? 'Obrigatório' : 'Recomendado'}
            </Badge>
          );
        }
        return null;
      }} />
    );
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto w-full max-w-7xl">
          <Tabs defaultValue="planos" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid h-auto w-full grid-cols-1 sm:grid-cols-3">
              <TabsTrigger value="planos" className="py-3 text-lg font-semibold text-muted-foreground data-[state=active]:bg-background/90 data-[state=active]:text-primary">Planos de Leitura</TabsTrigger>
              <TabsTrigger value="catalogo" className="py-3 text-lg font-semibold text-muted-foreground data-[state=active]:bg-background/90 data-[state=active]:text-primary">Todos os Livros</TabsTrigger>
              <TabsTrigger value="jogos" className="py-3 text-lg font-semibold text-muted-foreground data-[state=active]:bg-background/90 data-[state=active]:text-primary">Jogos e Outros</TabsTrigger>
            </TabsList>

             <div className="mt-6">
                <h1 className="font-headline text-2xl font-bold tracking-tight sm:text-3xl">
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
                      {Object.entries(productsByGrade).sort(([a], [b]) => Number(a) - Number(b)).map(([grade, gradeProducts]) => (
                        <AccordionItem value={`item-${grade}`} key={grade}>
                          <AccordionTrigger className="text-xl font-semibold">
                            {`${grade}º Ano`}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-6">
                                <div className="grid gap-6 lg:grid-cols-2">
                                     <div className="rounded-lg border bg-card p-6">
                                        <h3 className="font-headline text-2xl font-semibold">Kit Obrigatório do {grade}º Ano</h3>
                                        <p className="mt-2 text-muted-foreground">Compre todos os livros obrigatórios para o ano letivo.</p>
                                        <Button size="lg" className="mt-4" onClick={() => addKitToCart(gradeProducts.mandatory, `Kit Obrigatório do ${grade}º Ano - ${selectedSchool.name}`)}>
                                            <ShoppingCart className="mr-2 h-5 w-5" /> Adicionar Kit Obrigatório
                                        </Button>
                                    </div>
                                    {gradeProducts.recommended.length > 0 && (
                                        <div className="rounded-lg border bg-card p-6">
                                            <h3 className="font-headline text-2xl font-semibold">Kit Completo do {grade}º Ano</h3>
                                            <p className="mt-2 text-muted-foreground">Inclui livros obrigatórios e recomendados.</p>
                                            <Button size="lg" className="mt-4" onClick={() => addKitToCart(gradeProducts.all, `Kit Completo do ${grade}º Ano - ${selectedSchool.name}`)}>
                                                <ShoppingCart className="mr-2 h-5 w-5" /> Adicionar Kit Completo
                                            </Button>
                                        </div>
                                    )}
                                </div>


                                {showIndividual === grade ? (
                                    renderProductGridWithBadges(gradeProducts.all, grade)
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
                        <p className="text-muted-foreground">Ainda não há livros do plano de leitura para esta escola.</p>
                    </div>
                   )
                ) : (
                     <div className="mx-auto flex max-w-7xl flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
                        <h3 className="font-headline text-2xl font-semibold tracking-tight">Selecione uma escola</h3>
                        <p className="text-muted-foreground">Por favor, selecione uma escola para ver a lista de materiais.</p>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="catalogo" className="mt-6 space-y-6">
               <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Pesquisar por nome do livro..."
                            className="w-full rounded-lg bg-background pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-[280px]">
                            <SelectValue placeholder="Filtrar por categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Categorias</SelectItem>
                            {bookCategories.map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
              <ProductGrid products={filteredBooks} />
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
