
"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from 'next/navigation';

import ProductGrid from "@/components/product-grid";
import ProductGridWithBadges from "@/components/product-grid-with-badges";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ShoppingCart, Search, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/cart-context";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/context/data-context";
import { useLanguage } from "@/context/language-context";
import { getDisplayName, normalizeSearch } from "@/lib/utils";
import type { School, Product, ReadingPlanItem, Category } from "@/lib/types";
import { SidebarMenuSkeleton } from "@/components/ui/sidebar";


interface GradeProducts {
  mandatory: Product[];
  recommended: Product[];
  didactic_aids: Product[];
  all: Product[];
}



interface ShopPageContentProps {
  initialSchools: School[];
  initialProducts: Product[];
  initialReadingPlan: ReadingPlanItem[];
  initialCategories: Category[];
}

export const ShopPageContent = ({
  initialSchools,
  initialProducts,
  initialReadingPlan,
  initialCategories,
}: ShopPageContentProps) => {
  const { schools, products, readingPlan, categories, loading, setSchools, setProducts, setReadingPlan, setCategories } = useData();
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'planos';

  useEffect(() => {
    setSchools(initialSchools);
    setProducts(initialProducts);
    setReadingPlan(initialReadingPlan);
    setCategories(initialCategories);
  }, [initialSchools, initialProducts, initialReadingPlan, initialCategories, setSchools, setProducts, setReadingPlan, setCategories]);
  
  const [selectedSchool, setSelectedSchool] = useState<School | undefined>(
    undefined
  );
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);
  const [showIndividual, setShowIndividual] = useState<string | null>(null);
  const { addKitToCart } = useCart();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Atualizar URL sem recarregar a página
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    window.history.pushState(null, '', `?${params.toString()}`);
    
    // Rolar suavemente para o topo do conteúdo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [selectedBookCategory, setSelectedBookCategory] = useState("all");

  const [gameSearchQuery, setGameSearchQuery] = useState("");
  const [selectedGameCategory, setSelectedGameCategory] = useState("all");

  useEffect(() => {
    // Sync tab state if URL changes
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);


  const handleGoBackToSchoolSelection = () => {
    setSelectedSchool(undefined);
  }
  
  const productsById = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {} as Record<string, Product>);
  }, [products]);

  const schoolReadingPlan = useMemo(() => selectedSchool
    ? (readingPlan || []).filter((item) => item && item.schoolId === selectedSchool.id && item.grade !== undefined && item.grade !== null)
    : [], [selectedSchool, readingPlan]);

  const sortGradeKeys = (a: string, b: string) => {
    const getOrder = (grade: string | undefined) => {
        if (!grade) return 999;
        const lowerGrade = String(grade).toLowerCase();
        if (lowerGrade === 'iniciação' || lowerGrade === 'reception') return -1;
        
        if (lowerGrade === '1-4' || lowerGrade === '1st-4th') return 4.5;
        if (lowerGrade === '5-9' || lowerGrade === '5th-9th') return 9.5;
        if (lowerGrade === '10-12' || lowerGrade === '10th-12th') return 12.5;
        
        if (lowerGrade === 'outros' || lowerGrade === 'others' || lowerGrade === 'didactic_aids') return 100;
        
        const num = parseInt(lowerGrade, 10);
        return isNaN(num) ? 99 : num;
    };
    return getOrder(a) - getOrder(b);
  };

  const productsByGrade = useMemo(() => {
    const grades: { [key: string]: GradeProducts } = {};
    for (const item of schoolReadingPlan) {
      if (!item || !item.productId) {
        continue; // Skip if item or productId is undefined
      }
      const product = productsById[item.productId];
      if (product && product.stockStatus !== 'sold_out') {
        const gradeKey: string = String(item.grade || 'didactic_aids'); 
        if (!grades[gradeKey]) {
          grades[gradeKey] = { mandatory: [], recommended: [], didactic_aids: [], all: [] };
        }
        if (item.status === 'mandatory') {
            grades[gradeKey].mandatory.push(product);
        } else if (item.status === 'recommended') {
            grades[gradeKey].recommended.push(product);
        } else {
            grades[gradeKey].didactic_aids.push(product);
        }
        grades[gradeKey].all.push(product);
      }
    }
    // Deduplicate by product id to avoid React key collisions
    Object.keys(grades).forEach((g) => {
      const uniq = (arr: Product[]) => {
        const seen = new Set<string>();
        return arr.filter((p) => {
          if (!p || !p.id || seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
      };
      grades[g].mandatory = uniq(grades[g].mandatory);
      grades[g].recommended = uniq(grades[g].recommended);
      grades[g].didactic_aids = uniq(grades[g].didactic_aids);
      
      // Ensure "all" products are ordered: mandatory first, then recommended, then others
      grades[g].all = uniq([
        ...grades[g].mandatory,
        ...grades[g].recommended,
        ...grades[g].didactic_aids
      ]);
    });
    return grades;
  }, [schoolReadingPlan, productsById]);
  
  const filteredGames = useMemo(() => {
    return products.filter(p => {
        const productName = getDisplayName(p.name, language);
        const productDescription = typeof p.description === 'string'
            ? p.description
            : (typeof p.description === 'object' ? (p.description[language] || p.description.pt || '') : '');
        
        const normalizedSearch = normalizeSearch(gameSearchQuery);
        
        return p.type === 'game' && 
               p.stockStatus !== 'sold_out' &&
               (
                 normalizeSearch(productName).includes(normalizedSearch) ||
                 normalizeSearch(productDescription).includes(normalizedSearch)
               ) &&
               (selectedGameCategory === 'all' || p.category === selectedGameCategory)
    })
  }, [products, gameSearchQuery, selectedGameCategory, language]);

  const bookCategories = useMemo(() => (categories || []).filter(cat => cat && cat.type === 'book'), [categories]);
  const gameCategories = useMemo(() => (categories || []).filter(cat => cat && cat.type === 'game'), [categories]);


  const filteredBooks = useMemo(() => {
    return products.filter(p => {
        const productName = getDisplayName(p.name, language);
        const productDescription = typeof p.description === 'string'
            ? p.description
            : (typeof p.description === 'object' ? (p.description[language] || p.description.pt || '') : '');
        
        const normalizedSearch = normalizeSearch(bookSearchQuery);
        
        return p.type === 'book' &&
               p.stockStatus !== 'sold_out' &&
               (
                 normalizeSearch(productName).includes(normalizedSearch) ||
                 normalizeSearch(productDescription).includes(normalizedSearch)
               ) &&
               (selectedBookCategory === 'all' || p.category === selectedBookCategory)
    })
  }, [products, bookSearchQuery, selectedBookCategory, language]);


  const renderTitle = () => {
    switch (activeTab) {
      case "planos":
        return selectedSchool
          ? `${t('shop.reading_plan')}: ${getDisplayName(selectedSchool.name, language)}`
          : t('shop.select_your_school');
      case "catalogo":
        return t('shop.all_books');
      case "jogos":
        return t('shop.games_and_other_items');
      default:
        return "Neokudilonga";
    }
  };

  const renderDescription = () => {
    switch (activeTab) {
      case 'planos':
        return selectedSchool
          ? getDisplayName(selectedSchool.description, language)
          : t('shop.select_school_description');
      case 'catalogo':
        return t('shop.all_books_description');
      case 'jogos':
        return t('shop.games_description');
      default:
        return t('shop.default_description');
    }
  };

  
  const calculateKitPrice = (products: Product[]) => {
    return products.reduce((acc, product) => acc + (product.price || 0), 0);
  }

  const getGradeDisplayName = (grade: string) => {
    const lowerGrade = grade ? String(grade).toLowerCase() : "";
    if (lowerGrade === 'iniciação' || lowerGrade === 'reception') return t('grades.reception');
    if (lowerGrade === 'didactic_aids') return t('shop.didactic_aids');
    if (lowerGrade === '1-4') return "1ª - 4ª Classe (Auxiliares Didáticos)";
    if (lowerGrade === '5-9') return "5ª - 9ª Classe (Auxiliares Didáticos)";
    if (lowerGrade === '10-12') return "10ª - 12ª Classe (Auxiliares Didáticos)";
    return `${grade || ''}${t('grades.grade')}`;
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="mx-auto w-full max-w-7xl">
        <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid h-auto w-full grid-cols-1 sm:grid-cols-3">
            <TabsTrigger key="planos" value="planos" className="py-3 text-lg font-semibold text-muted-foreground data-[state=active]:bg-background/90 data-[state=active]:text-primary">{t('shop.tabs.reading_plans')}</TabsTrigger>
            <TabsTrigger key="catalogo" value="catalogo" className="py-3 text-lg font-semibold text-muted-foreground data-[state=active]:bg-background/90 data-[state=active]:text-primary">{t('shop.tabs.all_books')}</TabsTrigger>
            <TabsTrigger key="jogos" value="jogos" className="py-3 text-lg font-semibold text-muted-foreground data-[state=active]:bg-background/90 data-[state=active]:text-primary">{t('shop.tabs.games_and_others')}</TabsTrigger>
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
            {/* How it works section - shown only when no school is selected */}
            {!selectedSchool && (
              <section className="bg-muted/40 py-8 sm:py-12 lg:py-16 mb-8 rounded-lg">
                <div className="text-center px-4">
                  <h2 className="font-headline text-2xl font-bold sm:text-3xl md:text-4xl">{t('landing.how_it_works_title')}</h2>
                  <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/90">
                    {t('landing.how_it_works_subtitle')}
                  </p>
                  <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
                        <span className="font-bold text-2xl">1</span>
                      </div>
                      <h3 className="font-headline text-xl font-semibold">{t('landing.step1_title')}</h3>
                      <p className="text-foreground/80">{t('landing.step1_description')}</p>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
                        <span className="font-bold text-2xl">2</span>
                      </div>
                      <h3 className="font-headline text-xl font-semibold">{t('landing.step2_title')}</h3>
                      <p className="text-foreground/80">{t('landing.step2_description')}</p>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
                        <span className="font-bold text-2xl">3</span>
                      </div>
                      <h3 className="font-headline text-xl font-semibold">{t('landing.step3_title')}</h3>
                      <p className="text-foreground/80">{t('landing.step3_description')}</p>
                    </div>
                  </div>
                </div>
              </section>
            )}
            {selectedSchool ? (
                  <>
                  <div className="mb-4">
                      <Button variant="outline" onClick={handleGoBackToSchoolSelection}>
                          <ArrowLeft className="mr-2" />
                          {t('common.back')}
                      </Button>
                  </div>
                 {Object.keys(productsByGrade).length > 0 ? (
                  <Accordion type="single" collapsible className="w-full" defaultValue={`item-${(Object.keys(productsByGrade).sort(sortGradeKeys) as string[])[0] || ''}`} onValueChange={() => setShowIndividual(null)}>
                    {Object.entries(productsByGrade).sort((a, b) => sortGradeKeys(a[0], b[0])).map(([grade, gradeProducts]) => (
                      <AccordionItem value={`item-${grade}`} key={grade}>
                        <AccordionTrigger className="text-xl font-semibold">
                          {getGradeDisplayName(grade)}
                        </AccordionTrigger>
                        <AccordionContent>
                           {String(grade).toLowerCase() === 'didactic_aids' || 
                            String(grade).toLowerCase() === '1-4' || 
                            String(grade).toLowerCase() === '5-9' || 
                            String(grade).toLowerCase() === '10-12' || 
                            showIndividual === grade ? (
                              <div className="space-y-8">
                                {(String(grade).toLowerCase() === '1-4' || 
                                  String(grade).toLowerCase() === '5-9' || 
                                  String(grade).toLowerCase() === '10-12') && (
                                  <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700">
                                    {t('shop.individual_purchase_only')}
                                  </div>
                                )}
                                
                                {gradeProducts.mandatory.length > 0 && (
                                  <div className="space-y-4">
                                    <h3 className="font-headline text-2xl font-semibold text-blue-900">{t('shop.mandatory')}</h3>
                                    <ProductGridWithBadges products={gradeProducts.mandatory} grade={grade} schoolReadingPlan={schoolReadingPlan} />
                                  </div>
                                )}

                                {gradeProducts.recommended.length > 0 && (
                                  <div className="space-y-4">
                                    <h3 className="font-headline text-2xl font-semibold text-amber-900">{t('shop.recommended')}</h3>
                                    <ProductGridWithBadges products={gradeProducts.recommended} grade={grade} schoolReadingPlan={schoolReadingPlan} />
                                  </div>
                                )}

                                {gradeProducts.didactic_aids.length > 0 && (
                                  <div className="space-y-4">
                                    <h3 className="font-headline text-2xl font-semibold">{t('shop.didactic_aids')}</h3>
                                    <ProductGridWithBadges products={gradeProducts.didactic_aids} grade={grade} schoolReadingPlan={schoolReadingPlan} />
                                  </div>
                                )}

                                {gradeProducts.all.length > 0 && 
                                 gradeProducts.mandatory.length === 0 && 
                                 gradeProducts.recommended.length === 0 && 
                                 gradeProducts.didactic_aids.length === 0 && (
                                  <ProductGridWithBadges products={gradeProducts.all} grade={grade} schoolReadingPlan={schoolReadingPlan} />
                                )}
                              </div>
                           ) : (
                              <div className="space-y-6">
                                  <div className="grid gap-6 lg:grid-cols-2">
              {/* Kit Obrigatório */}
              {gradeProducts.mandatory.length > 0 && (
                  <div key="mandatory-kit" className="flex flex-col rounded-xl border-2 border-blue-600 bg-blue-50/30 p-6 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                          <Badge className="w-fit mb-2 bg-blue-600 hover:bg-blue-700 text-white border-none">{t('shop.essential')}</Badge>
                          <h3 className="font-headline text-2xl font-bold text-blue-900">{t('shop.mandatory_kit', { count: gradeProducts.mandatory.length })}</h3>
                        </div>
                      </div>
                      <p className="text-blue-800/80 mb-6 flex-grow">{t('shop.buy_all_mandatory')}</p>
                      <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg" onClick={() => addKitToCart(gradeProducts.mandatory, t('shop.mandatory_kit_name', { grade: getGradeDisplayName(grade), school: getDisplayName(selectedSchool.name, language) }))}>
                          <ShoppingCart className="mr-2 h-5 w-5" /> 
                          {t('common.add_for')} {calculateKitPrice(gradeProducts.mandatory).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </Button>
                  </div>
              )}

              {/* Kit Completo (Obrigatórios + Recomendados) */}
              {gradeProducts.recommended.length > 0 && (
                  <div key="complete-kit" className="flex flex-col rounded-xl border-2 border-amber-500 bg-amber-50/30 p-6 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                          <Badge className="w-fit mb-2 bg-amber-500 hover:bg-amber-600 text-white border-none">Completo</Badge>
                          <h3 className="font-headline text-2xl font-bold text-amber-900">
                            {t('shop.complete_kit', { 
                              grade: getGradeDisplayName(grade), 
                              count: gradeProducts.mandatory.length + gradeProducts.recommended.length 
                            })}
                          </h3>
                        </div>
                      </div>
                                              <p className="text-amber-800/80 mb-6 flex-grow">{t('shop.buy_all_for_school_year')}</p>
                                              <Button size="lg" className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg" onClick={() => addKitToCart([...gradeProducts.mandatory, ...gradeProducts.recommended], t('shop.complete_kit_name', { grade: getGradeDisplayName(grade), school: getDisplayName(selectedSchool.name, language) }))}>
                                                  <ShoppingCart className="mr-2 h-5 w-5" /> 
                                                  {t('common.add_for')} {calculateKitPrice([...gradeProducts.mandatory, ...gradeProducts.recommended]).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                              </Button>
                                          </div>
                                      )}
                                  </div>

                                  {showIndividual !== grade && (
                                      <div className="text-center mt-6">
                                          <Button variant="outline" onClick={() => setShowIndividual(grade)}>
                                              {t('shop.buy_separately')}
                                              <ChevronRight className="ml-2 h-4 w-4" />
                                          </Button>
                                      </div>
                                  )}

                                  {gradeProducts.didactic_aids.length > 0 && (
                                     <div className="mt-8">
                                       <h3 className="font-headline text-2xl font-semibold mb-4">{t('shop.didactic_aids')}</h3>
                                       <ProductGridWithBadges products={gradeProducts.didactic_aids} grade={grade} schoolReadingPlan={schoolReadingPlan} />
                                     </div>
                                   )}
                              </div>
                           )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                 ) : (
                   <div className="mx-auto flex max-w-7xl flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
                      <h3 className="font-headline text-2xl font-semibold tracking-tight">{t('shop.no_books_found_title')}</h3>
                      <p className="text-muted-foreground">{t('shop.no_books_found_description')}</p>
                  </div>
                 )}
                 </>
              ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {schools.map(school => (
                           <button
                            key={school.id}
                            onClick={() => setSelectedSchool(school)}
                            className="flex flex-col items-center justify-center rounded-lg border bg-secondary p-6 text-center transition-all hover:shadow-lg"
                          >
                            <h3 className="font-headline text-xl font-semibold tracking-tight">
                              {getDisplayName(school.name, language)}
                            </h3>
                            </button>
                      ))}
                  </div>
              )}
          </TabsContent>

          <TabsContent value="catalogo" className="mt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('shop.search_books_placeholder')}
                  className="w-full rounded-lg border-primary/20 bg-background pl-8"
                  value={bookSearchQuery}
                  onChange={(e) => setBookSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedBookCategory} onValueChange={setSelectedBookCategory}>
                <SelectTrigger className="w-[180px] rounded-lg border-primary/20">
                  <SelectValue placeholder={t('shop.all_categories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('shop.all_categories')}</SelectItem>
                  {bookCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {getDisplayName(category.name, language)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-6">
              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <SidebarMenuSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <ProductGrid products={filteredBooks} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="jogos" className="mt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('shop.search_games_placeholder')}
                  className="w-full rounded-lg border-primary/20 bg-background pl-8"
                  value={gameSearchQuery}
                  onChange={(e) => setGameSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedGameCategory} onValueChange={setSelectedGameCategory}>
                  <SelectTrigger className="w-[180px] rounded-lg border-primary/20">
                    <SelectValue placeholder={t('shop.all_categories')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('shop.all_categories')}</SelectItem>
                    {gameCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {getDisplayName(category.name, language)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6">
              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <SidebarMenuSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <ProductGrid products={filteredGames} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
