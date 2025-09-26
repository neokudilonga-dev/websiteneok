
"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from 'next/navigation';

import ProductGrid from "@/components/product-grid";
import ProductGridWithBadges from "@/components/product-grid-with-badges";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ShoppingCart, Search, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/context/data-context";
import { useLanguage } from "@/context/language-context";
import { getDisplayName } from "@/lib/utils";
import type { School, Product, ReadingPlanItem, Category } from "@/lib/types";
import ProductCard from "./product-card";
import { SidebarMenuSkeleton } from "@/components/ui/sidebar";


interface GradeProducts {
  mandatory: Product[];
  recommended: Product[];
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
  const [showIndividual, setShowIndividual] = useState<string | null>(null);
  const { addKitToCart } = useCart();
  
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

  const handleSchoolSelect = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    setSelectedSchool(school);
    setShowIndividual(null); // Reset when school changes
  };

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
    ? readingPlan.filter((item) => item.schoolId === selectedSchool.id && item.grade !== undefined && item.grade !== null)
    : [], [selectedSchool, readingPlan]);

  const productsByGrade = useMemo(() => {
    const grades: { [key: string]: GradeProducts } = {};
    for (const item of schoolReadingPlan) {
      if (!item.productId) {
        continue; // Skip if productId is undefined
      }
      const product = productsById[item.productId];
      if (product && product.stockStatus !== 'sold_out') {
        const gradeKey: string = item.grade as string; // Explicitly cast to string
        if (!grades[gradeKey]) {
          grades[gradeKey] = { mandatory: [], recommended: [], all: [] };
        }
        if (item.status === 'mandatory') {
            grades[gradeKey].mandatory.push(product);
        } else {
            grades[gradeKey].recommended.push(product);
        }
        grades[gradeKey].all.push(product);
      }
    }
    return grades;
  }, [schoolReadingPlan, productsById]);
  
  const filteredGames = useMemo(() => {
    return products.filter(p => {
        const productName = typeof p.name === 'string'
            ? p.name
            : (typeof p.name === 'object' ? (p.name[language] || p.name.pt || '') : '');
        return p.type === 'game' && 
               p.stockStatus !== 'sold_out' &&
               productName.toLowerCase().includes(gameSearchQuery.toLowerCase()) &&
               (selectedGameCategory === 'all' || p.category === selectedGameCategory)
    })
  }, [products, gameSearchQuery, selectedGameCategory, language]);

  const bookCategories = useMemo(() => categories.filter(c => c.type === 'book'), [categories]);
  const gameCategories = useMemo(() => categories.filter(c => c.type === 'game'), [categories]);


  const filteredBooks = useMemo(() => {
    return products.filter(p => {
        const productName = typeof p.name === 'string'
            ? p.name
            : (typeof p.name === 'object' ? (p.name[language] || p.name.pt || '') : '');
        return p.type === 'book' &&
               p.stockStatus !== 'sold_out' &&
               productName.toLowerCase().includes(bookSearchQuery.toLowerCase()) &&
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

  const renderProductGridWithBadges = (products: Product[], grade: string) => {
    const gradePlan = schoolReadingPlan.filter(p => String(p.grade) === grade);

    const bookCategories = useMemo(() => categories.filter(cat => cat.type === 'book'), [categories]);
  const gameCategories = useMemo(() => categories.filter(cat => cat.type === 'game'), [categories]);

  return (
      <ProductGrid products={products} renderBadge={(product) => {
        const planItem = gradePlan.find(gp => gp.productId === product.id);
        if (planItem) {
          return (
            <Badge
              variant={planItem.status === 'mandatory' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {planItem.status === 'mandatory' ? t('shop.mandatory') : t('shop.recommended')}
            </Badge>
          );
        }
        return null;
      }} />
    );
  };
  
  const calculateKitPrice = (products: Product[]) => {
    return products.reduce((acc, product) => acc + product.price, 0);
  }

  const customGradeSort = (a: [string, any], b: [string, any]) => {
      const gradeA = a[0];
      const gradeB = b[0];

      const getOrder = (grade: string) => {
          if (grade.toLowerCase() === 'iniciação' || grade.toLowerCase() === 'reception') return -1;
          if (grade.toLowerCase() === 'outros' || grade.toLowerCase() === 'others') return 100;
          const num = parseInt(grade, 10);
          return isNaN(num) ? 99 : num;
      };

      const orderA = getOrder(gradeA);
      const orderB = getOrder(gradeB);

      return orderA - orderB;
  };

  const getGradeDisplayName = (grade: string) => {
    if (String(grade).toLowerCase() === 'iniciação') return t('grades.reception');
    if (String(grade).toLowerCase() === 'outros') return t('grades.others');
    return `${grade}${t('grades.grade')}`;
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="mx-auto w-full max-w-7xl">
        <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid h-auto w-full grid-cols-1 sm:grid-cols-3">
            <TabsTrigger value="planos" className="py-3 text-lg font-semibold text-muted-foreground data-[state=active]:bg-background/90 data-[state=active]:text-primary">{t('shop.tabs.reading_plans')}</TabsTrigger>
            <TabsTrigger value="catalogo" className="py-3 text-lg font-semibold text-muted-foreground data-[state=active]:bg-background/90 data-[state=active]:text-primary">{t('shop.tabs.all_books')}</TabsTrigger>
            <TabsTrigger value="jogos" className="py-3 text-lg font-semibold text-muted-foreground data-[state=active]:bg-background/90 data-[state=active]:text-primary">{t('shop.tabs.games_and_others')}</TabsTrigger>
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
              {selectedSchool ? (
                  <>
                  <div className="mb-4">
                      <Button variant="outline" onClick={handleGoBackToSchoolSelection}>
                          <ArrowLeft className="mr-2" />
                          {t('common.back')}
                      </Button>
                  </div>
                 {Object.keys(productsByGrade).length > 0 ? (
                  <Accordion type="single" collapsible className="w-full" defaultValue={`item-${Object.keys(productsByGrade).sort((a,b) => customGradeSort([a,0],[b,0]))[0]}`} onValueChange={() => setShowIndividual(null)}>
                    {Object.entries(productsByGrade).sort(customGradeSort).map(([grade, gradeProducts]) => (
                      <AccordionItem value={`item-${grade}`} key={grade}>
                        <AccordionTrigger className="text-xl font-semibold">
                          {getGradeDisplayName(grade)}
                        </AccordionTrigger>
                        <AccordionContent>
                           {String(grade).toLowerCase() === 'outros' || showIndividual === grade ? (
                              <ProductGridWithBadges products={gradeProducts.all} grade={grade} schoolReadingPlan={schoolReadingPlan} />
                           ) : (
                              <div className="space-y-6">
                                  <div className="grid gap-6 lg:grid-cols-2">
                                      {selectedSchool.hasRecommendedPlan ? (
                                          <>
                                              {gradeProducts.mandatory.length > 0 && (
                                                  <div className="rounded-lg bg-card p-6">
                                                      <h3 className="font-headline text-2xl font-semibold">{t('shop.mandatory_kit', { count: gradeProducts.mandatory.length })}</h3>
                                                      <p className="mt-2 text-muted-foreground">{t('shop.buy_all_mandatory')}</p>
                                                      <Button size="lg" className="mt-4" onClick={() => addKitToCart(gradeProducts.mandatory, t('shop.mandatory_kit_name', { grade: getGradeDisplayName(grade), school: getDisplayName(selectedSchool.name, language) }))}>
                                                          <ShoppingCart className="mr-2 h-5 w-5" /> 
                                                          {t('common.add_for')} {calculateKitPrice(gradeProducts.mandatory).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                      </Button>
                                                  </div>
                                              )}
                                              {gradeProducts.recommended.length > 0 && (
                                                  <div className="rounded-lg border bg-card p-6">
                                                      <h3 className="font-headline text-2xl font-semibold">{t('shop.recommended_kit', { count: gradeProducts.recommended.length })}</h3>
                                                      <p className="mt-2 text-muted-foreground">{t('shop.buy_all_recommended')}</p>
                                                      <Button size="lg" className="mt-4" onClick={() => addKitToCart(gradeProducts.recommended, t('shop.recommended_kit_name', { grade: getGradeDisplayName(grade), school: getDisplayName(selectedSchool.name, language) }))}>
                                                          <ShoppingCart className="mr-2 h-5 w-5" /> 
                                                          {t('common.add_for')} {calculateKitPrice(gradeProducts.recommended).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                      </Button>
                                                  </div>
                                              )}
                                          </>
                                      ) : (
                                          gradeProducts.all.length > 0 &&
                                          <div className="rounded-lg border bg-card p-6 lg:col-span-2">
                                              <h3 className="font-headline text-2xl font-semibold">{t('shop.complete_kit', { grade: getGradeDisplayName(grade), count: gradeProducts.all.length })}</h3>
                                              <p className="mt-2 text-muted-foreground">{t('shop.buy_all_for_school_year')}</p>
                                              <Button size="lg" className="mt-4" onClick={() => addKitToCart(gradeProducts.all, t('shop.complete_kit_name', { grade: getGradeDisplayName(grade), school: getDisplayName(selectedSchool.name, language) }))}>
                                                  <ShoppingCart className="mr-2 h-5 w-5" /> 
                                                  {t('common.add_for')} {calculateKitPrice(gradeProducts.all).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
                            className="flex flex-col items-center justify-center rounded-lg border p-6 text-center transition-all hover:shadow-lg"
                          >
                            <h3 className="font-headline text-xl font-semibold tracking-tight">
                              {getDisplayName(school.name, language)}
                            </h3>
                            <p className="mt-1 text-muted-foreground">
                              {getDisplayName(school.description, language)}
                            </p>
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
                  className="w-full rounded-lg bg-background pl-8"
                  value={bookSearchQuery}
                  onChange={(e) => setBookSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedBookCategory} onValueChange={setSelectedBookCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('shop.filter_by_category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all_categories')}</SelectItem>
                  {bookCategories.map((category) => (
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
                  className="w-full rounded-lg bg-background pl-8"
                  value={gameSearchQuery}
                  onChange={(e) => setGameSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedGameCategory} onValueChange={setSelectedGameCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('shop.filter_by_category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all_categories')}</SelectItem>
                  {gameCategories.map((category) => (
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
                <ProductGrid products={filteredGames} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
