"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, BookOpen, Eye, EyeOff, Check, Share2, Copy, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useLanguage } from "@/context/language-context";
import Header from "@/components/header";
import { normalizeImageUrl, getDisplayName } from "@/lib/utils";
import type { School, Product, ReadingPlanItem, CartItem } from "@/lib/types";

interface SchoolReadingPlanClientProps {
  school: School;
  products: Product[];
  readingPlan: ReadingPlanItem[];
  allProducts: Product[];
}

export default function SchoolReadingPlanClient({
  school,
  products,
  readingPlan,
  allProducts,
}: SchoolReadingPlanClientProps) {
  const { t, language } = useLanguage();
  const { addToCart, addKitToCart: addKitToCartContext, cartItems } = useCart();
  const [previewKit, setPreviewKit] = useState<string | null>(null);

  const schoolName = useMemo(() => getDisplayName(school.name, language), [school.name, language]);

  // Group products by grade from reading plan
  const productsByGrade = useMemo(() => {
    const gradeMap = new Map<string, { mandatory: Product[]; optional: Product[]; complete: Product[] }>();
    
    readingPlan.forEach((item) => {
      const product = allProducts.find((p) => p.id === item.productId);
      if (!product) return;

      const gradeKey = String(item.grade);
      if (!gradeMap.has(gradeKey)) {
        gradeMap.set(gradeKey, { mandatory: [], optional: [], complete: [] });
      }

      const gradeProducts = gradeMap.get(gradeKey)!;
      
      if (item.status === "mandatory") {
        gradeProducts.mandatory.push(product);
      } else if (item.status === "recommended") {
        gradeProducts.optional.push(product);
      }
      
      // Add to complete list (all books for this grade)
      if (!gradeProducts.complete.find(p => p.id === product.id)) {
        gradeProducts.complete.push(product);
      }
    });

    return gradeMap;
  }, [readingPlan, allProducts]);

  const grades = useMemo(() => {
    return Array.from(productsByGrade.keys()).sort((a, b) => {
      // Try to sort numerically first
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      // Fall back to string comparison for non-numeric grades
      return a.localeCompare(b);
    });
  }, [productsByGrade]);

  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Copy link function
  const copyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Scroll to top when page loads - delay to ensure content is rendered
  useEffect(() => {
    // Immediate scroll
    window.scrollTo(0, 0);
    // Also scroll after a short delay to handle any late rendering
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const gradeProducts = selectedGrade ? productsByGrade.get(selectedGrade) : null;

  const calculateKitPrice = (items: Product[]) => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  const isInCart = (productId: string) => {
    return cartItems.some((item: CartItem) => item.id === productId);
  };

  const isKitInCart = (items: Product[], kitId: string) => {
    return cartItems.some((item: CartItem) => item.kitId === kitId);
  };

  const addToCartLocal = (product: Product) => {
    addToCart(product);
  };

  const addKitToCartLocal = (items: Product[], kitName: string) => {
    addKitToCartContext(items, kitName);
  };

  const getGradeDisplayName = (grade: string) => {
    if (grade === 'other') return t('shop.other_books');
    if (grade.includes('1')) return `1º ${t('shop.ano')}`;
    if (grade.includes('2')) return `2º ${t('shop.ano')}`;
    if (grade.includes('3')) return `3º ${t('shop.ano')}`;
    if (grade.includes('4')) return `4º ${t('shop.ano')}`;
    if (grade.includes('5')) return `5º ${t('shop.ano')}`;
    if (grade.includes('6')) return `6º ${t('shop.ano')}`;
    if (grade.includes('7')) return `7º ${t('shop.ano')}`;
    if (grade.includes('8')) return `8º ${t('shop.ano')}`;
    if (grade.includes('9')) return `9º ${t('shop.ano')}`;
    if (grade.includes('10')) return `10º ${t('shop.ano')}`;
    if (grade.includes('11')) return `11º ${t('shop.ano')}`;
    if (grade.includes('12')) return `12º ${t('shop.ano')}`;
    if (grade.includes('13')) return `13º ${t('shop.ano')}`;
    return grade;
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <div className="mb-6">
            <Link href="/loja">
              <Button variant="ghost" className="pl-0 text-blue-600 hover:text-blue-800">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('shop.back_to_shop') || 'Voltar à Loja'}
              </Button>
            </Link>
          </div>

          {/* School Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
              {school.logo ? (
                <div className="relative h-16 w-16 rounded-full overflow-hidden">
                  <Image
                    src={normalizeImageUrl(school.logo)}
                    alt={schoolName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <BookOpen className="h-8 w-8 text-blue-600" />
              )}
            </div>
            <h1 className="font-headline text-3xl font-bold text-blue-900 sm:text-4xl">
              {schoolName}
            </h1>
            <p className="mt-2 text-lg text-blue-700/80">
              {t('shop.reading_plan') || 'Plano de Leitura'}
            </p>
            <p className="mt-1 text-sm text-blue-600/70">
              {t('shop.direct_link_notice') || 'Link directo para pais da'} {schoolName}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={copyLink}
              className="mt-4 gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Link Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar Link para Partilhar
                </>
              )}
            </Button>
          </div>

          {/* Grade Selection */}
          {grades.length > 0 && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-blue-800 mb-3">
                {t('shop.select_grade') || 'Selecione o Ano'}:
              </label>
              <div className="flex flex-wrap gap-2">
                {grades.map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedGrade === grade
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    {getGradeDisplayName(grade)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products by Category */}
          {gradeProducts && (
            <div className="space-y-8">
              {/* Mandatory Books */}
              {gradeProducts.mandatory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-blue-900">
                      {t('shop.mandatory_books') || 'Livros Obrigatórios'}
                    </h2>
                    <Badge variant="default" className="bg-blue-600">
                      {gradeProducts.mandatory.length} {t('shop.books') || 'livros'}
                    </Badge>
                  </div>

                  {/* Kit Card */}
                  <Card className="mb-6 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-blue-900">
                            {t('shop.mandatory_kit') || 'Kit Obrigatório'} - {getGradeDisplayName(selectedGrade)}
                          </h3>
                          <p className="text-blue-700/70 text-sm mt-1">
                            {t('shop.buy_all_mandatory') || 'Compre todos os livros obrigatórios de uma vez'}
                          </p>
                          
                          {/* Preview Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 w-full sm:w-auto border-blue-300 text-blue-700 hover:bg-blue-100"
                            onClick={() => setPreviewKit(previewKit === `mandatory-${selectedGrade}` ? null : `mandatory-${selectedGrade}`)}
                          >
                            {previewKit === `mandatory-${selectedGrade}` ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                            {previewKit === `mandatory-${selectedGrade}`
                              ? (t('shop.hide_kit_contents') || 'Esconder Conteúdo')
                              : (t('shop.view_products') || 'Ver Produtos')}
                          </Button>

                          {/* Kit Contents Preview */}
                          {previewKit === `mandatory-${selectedGrade}` && (
                            <div className="mt-4 rounded-lg bg-white/80 p-4 border border-blue-100">
                              <p className="mb-2 text-sm font-semibold text-blue-900">
                                {t('shop.kit_contents_title') || 'Livros incluídos'}:
                              </p>
                              <ul className="space-y-3">
                                {gradeProducts.mandatory.map((book, idx) => (
                                  <li key={idx} className="flex items-center gap-3 text-sm text-blue-800/80">
                                    <div className="relative h-14 w-12 flex-shrink-0 rounded-md overflow-hidden border border-blue-200 bg-gray-50">
                                      <Image
                                        src={normalizeImageUrl(Array.isArray(book.image) ? book.image[0] : book.image) || "/placeholder.svg"}
                                        alt={getDisplayName(book.name, language)}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <span className="flex-1">{getDisplayName(book.name, language)}</span>
                                    <span className="text-xs font-medium text-blue-600">{book.price?.toLocaleString('pt-PT')} Kz</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <Button
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg w-full sm:w-auto"
                          onClick={() => addKitToCartLocal(
                            gradeProducts.mandatory,
                            `${t('shop.mandatory_kit') || 'Kit Obrigatório'} - ${getGradeDisplayName(selectedGrade)}`
                          )}
                          disabled={isKitInCart(gradeProducts.mandatory, `mandatory-${school.id}-${selectedGrade}`)}
                        >
                          {isKitInCart(gradeProducts.mandatory, `mandatory-${school.id}-${selectedGrade}`) ? (
                            <>
                              <Check className="mr-2 h-5 w-5" />
                              {t('common.in_cart') || 'No Carrinho'}
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="mr-2 h-5 w-5" />
                              {t('common.add_for') || 'Adicionar'} {calculateKitPrice(gradeProducts.mandatory).toLocaleString('pt-PT')} Kz
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Individual Books Grid */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {gradeProducts.mandatory.map((product) => (
                      <Card key={product.id} className="group overflow-hidden border-blue-100 hover:shadow-lg transition-shadow">
                        <Link href={`/produto/${product.id}`}>
                          <div className="aspect-square overflow-hidden bg-gray-50">
                            <Image
                              src={normalizeImageUrl(Array.isArray(product.image) ? product.image[0] : product.image) || "/placeholder.svg"}
                              alt={getDisplayName(product.name, language)}
                              width={200}
                              height={200}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                        </Link>
                        <CardContent className="p-3">
                          <Link href={`/produto/${product.id}`}>
                            <h3 className="text-sm font-medium text-blue-900 line-clamp-2 hover:text-blue-700">
                              {getDisplayName(product.name, language)}
                            </h3>
                          </Link>
                          <p className="mt-1 text-sm font-semibold text-blue-700">
                            {product.price.toLocaleString('pt-PT')} Kz
                          </p>
                          <Button
                            size="sm"
                            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => addToCartLocal(product)}
                            disabled={isInCart(product.id)}
                          >
                            {isInCart(product.id) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <ShoppingCart className="h-4 w-4" />
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Complete Kit (All Books) */}
              {gradeProducts.complete.length > 0 && (
                <div className="mt-8">
                  <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-green-900">
                            {t('shop.complete_kit') || 'Kit Completo'} - {getGradeDisplayName(selectedGrade)}
                          </h3>
                          <p className="text-green-700/70 text-sm mt-1">
                            {t('shop.buy_all_books') || 'Todos os livros do ano (obrigatórios + opcionais)'}
                          </p>
                          <Badge className="mt-2 bg-green-100 text-green-800">
                            {gradeProducts.complete.length} {t('shop.books') || 'livros'}
                          </Badge>

                          {/* Preview Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 w-full sm:w-auto border-green-300 text-green-700 hover:bg-green-100"
                            onClick={() => setPreviewKit(previewKit === `complete-${selectedGrade}` ? null : `complete-${selectedGrade}`)}
                          >
                            {previewKit === `complete-${selectedGrade}` ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                            {previewKit === `complete-${selectedGrade}`
                              ? (t('shop.hide_kit_contents') || 'Esconder Conteúdo')
                              : (t('shop.view_products') || 'Ver Produtos')}
                          </Button>

                          {/* Kit Contents Preview */}
                          {previewKit === `complete-${selectedGrade}` && (
                            <div className="mt-4 rounded-lg bg-white/80 p-4 border border-green-100">
                              <p className="mb-2 text-sm font-semibold text-green-900">
                                {t('shop.kit_contents_title') || 'Livros incluídos'}:
                              </p>
                              <ul className="space-y-3">
                                {gradeProducts.complete.map((book, idx) => (
                                  <li key={idx} className="flex items-center gap-3 text-sm text-green-800/80">
                                    <div className="relative h-14 w-12 flex-shrink-0 rounded-md overflow-hidden border border-green-200 bg-gray-50">
                                      <Image
                                        src={normalizeImageUrl(Array.isArray(book.image) ? book.image[0] : book.image) || "/placeholder.svg"}
                                        alt={getDisplayName(book.name, language)}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <span className="flex-1">{getDisplayName(book.name, language)}</span>
                                    {gradeProducts.mandatory.find(b => b.id === book.id) && (
                                      <Badge variant="outline" className="text-xs border-green-300 text-green-700">Obrigatório</Badge>
                                    )}
                                    <span className="text-xs font-medium text-green-600">{book.price?.toLocaleString('pt-PT')} Kz</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <Button
                          size="lg"
                          className="bg-green-600 hover:bg-green-700 text-white shadow-lg w-full sm:w-auto"
                          onClick={() => addKitToCartLocal(
                            gradeProducts.complete,
                            `${t('shop.complete_kit') || 'Kit Completo'} - ${getGradeDisplayName(selectedGrade)}`
                          )}
                          disabled={isKitInCart(gradeProducts.complete, `complete-${school.id}-${selectedGrade}`)}
                        >
                          {isKitInCart(gradeProducts.complete, `complete-${school.id}-${selectedGrade}`) ? (
                            <>
                              <Check className="mr-2 h-5 w-5" />
                              {t('common.in_cart') || 'No Carrinho'}
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="mr-2 h-5 w-5" />
                              {t('common.add_for') || 'Adicionar'} {calculateKitPrice(gradeProducts.complete).toLocaleString('pt-PT')} Kz
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* No Reading Plan Message */}
          {(!gradeProducts || gradeProducts.mandatory.length === 0) && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-blue-300" />
              <h3 className="mt-4 text-lg font-medium text-blue-900">
                {t('shop.no_reading_plan') || 'Nenhum plano de leitura disponível'}
              </h3>
              <p className="mt-2 text-blue-700/70">
                {t('shop.contact_school') || 'Contacte a escola para mais informações'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
