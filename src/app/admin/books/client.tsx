
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Search, Filter } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { Product, ReadingPlanItem, School } from "@/lib/types";
import { AddEditBookSheet } from "@/components/admin/add-edit-book-sheet";
import { Input } from "@/components/ui/input";
import { useData } from "@/context/data-context";
import { useLanguage } from "@/context/language-context";
import { deleteImageFromFirebase } from "@/lib/firebase";

interface BooksPageClientProps {
    initialProducts: Product[];
    initialReadingPlan: ReadingPlanItem[];
    initialSchools: School[];
    initialPublishers: string[];
}

export default function BooksPageClient({ initialProducts, initialReadingPlan, initialSchools, initialPublishers }: BooksPageClientProps) {
  const { products, readingPlan, schools, publishers, setProducts, setReadingPlan, setSchools, setPublishers, deleteProduct } = useData();
  const { t, language } = useLanguage();

  useEffect(() => {
    setProducts(initialProducts);
    setReadingPlan(initialReadingPlan);
    setSchools(initialSchools);
    setPublishers(initialPublishers);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProducts, initialReadingPlan, initialSchools, initialPublishers]);

  const [isSheetOpen, setSheetOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Product | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [publisherFilter, setPublisherFilter] = useState("all");

  const bookProducts = useMemo(() => products.filter(p => p.type === 'book'), [products]);

  const getProductName = (product: Product) => {
    if (!product || !product.id) return 'No ID';
    return product.id; // Now returns the document ID as the name
  }

  const filteredProducts = useMemo(() => {
    return bookProducts.filter((product) => {
      const name = getProductName(product) || '';
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStock = stockFilter === 'all' || product.stockStatus === stockFilter;
      const matchesPublisher = publisherFilter === 'all' || product.publisher === publisherFilter;
      return matchesSearch && matchesStock && matchesPublisher;
    });
  }, [bookProducts, searchQuery, stockFilter, publisherFilter]); // Removed language from dependency array

  const handleAddBook = () => {
    setSelectedBook(undefined);
    setSheetOpen(true);
  };

  const handleEditBook = (book: Product) => {
    setSelectedBook(book);
    setSheetOpen(true);
  };

  const handleDeleteBook = (book: Product) => {
    deleteProduct(book.id, book.image);
  };

  const getSchoolAbbreviation = (schoolId: string) => {
    return schools.find(s => s.id === schoolId)?.abbreviation || schoolId;
  }
  
  const getBookReadingPlan = (productId: string) => {
    return readingPlan.filter(item => item.productId === productId);
  }
  
  const getStatusLabel = (status: Product['stockStatus']) => {
    if (status === 'sold_out') return t('stock_status.sold_out');
    if (status === 'in_stock') return t('stock_status.in_stock');
    if (status === 'out_of_stock') return t('stock_status.out_of_stock');
    return '';
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t('books_page.title')}</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={t('books_page.search_placeholder')}
                        className="w-full rounded-lg bg-background pl-8 sm:w-[200px] lg:w-[300px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="shrink-0">
                      <Filter className="mr-2" />
                      {t('common.filter')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>{t('books_page.filter_by_stock')}</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={stockFilter} onValueChange={setStockFilter}>
                        <DropdownMenuRadioItem value="all">{t('common.all')}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="in_stock">{t('stock_status.in_stock')}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="out_of_stock">{t('stock_status.out_of_stock')}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="sold_out">{t('stock_status.sold_out')}</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                     <DropdownMenuLabel>{t('books_page.filter_by_publisher')}</DropdownMenuLabel>
                     <DropdownMenuRadioGroup value={publisherFilter} onValueChange={setPublisherFilter}>
                        <DropdownMenuRadioItem value="all">{t('common.all_publishers')}</DropdownMenuRadioItem>
                        {publishers.map(publisher => (
                            <DropdownMenuRadioItem key={publisher} value={publisher}>{publisher}</DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={handleAddBook} className="shrink-0">
                    <PlusCircle className="mr-2" />
                    {t('books_page.add_new_book')}
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">{t('common.image')}</span>
                </TableHead>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('common.publisher')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('common.stock')}</TableHead>
                <TableHead>{t('common.price')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('common.reading_plan')}</TableHead>
                <TableHead>
                  <span className="sr-only">{t('common.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={getProductName(product)}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.image || 'https://placehold.co/64x64.png'}
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.id}</TableCell> // Display document ID as title
                   <TableCell className="text-muted-foreground">{product.publisher || 'N/A'}</TableCell>
                   <TableCell>
                      <Badge 
                        variant={product.stockStatus === 'sold_out' ? 'destructive' : product.stockStatus === 'out_of_stock' ? 'secondary' : 'default'}
                      >
                         {getStatusLabel(product.stockStatus)}
                      </Badge>
                   </TableCell>
                   <TableCell>
                    {product.stock}
                   </TableCell>
                  <TableCell>{product.price.toLocaleString('pt-PT', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {getBookReadingPlan(product.id).length > 0 ? (
                        getBookReadingPlan(product.id).map(item => (
                            <Badge key={item.id} variant={item.status === 'mandatory' ? 'default' : 'secondary'} title={`${getSchoolAbbreviation(item.schoolId)} - Grade ${item.grade} (${item.status})`}>
                                {getSchoolAbbreviation(item.schoolId)} - {item.grade}º Ano
                            </Badge>
                        ))
                      ): (
                        <Badge variant="outline">{t('books_page.not_in_plan')}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">{t('common.toggle_menu')}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditBook(product)}>
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteBook(product)}
                        >
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddEditBookSheet
        isOpen={isSheetOpen}
        setIsOpen={setSheetOpen}
        book={selectedBook}
        onBookSaved={(updatedBook, oldImageUrl) => {
          if (updatedBook) {
            (setProducts as any)((prevProducts: Product[]) => {
              const existingIndex = prevProducts.findIndex(p => p.id === updatedBook.id);
              if (existingIndex > -1) {
                // Update existing book
                return prevProducts.map(p => p.id === updatedBook.id ? updatedBook : p);
              } else {
                // Add new book
                return [...prevProducts, updatedBook];
              }
            });
            if (oldImageUrl && oldImageUrl !== updatedBook.image) {
              deleteImageFromFirebase(oldImageUrl);
            }
          }
          setSheetOpen(false);
        }}
      />
    </>
  );
}
