
"use client";

import { useState, useMemo } from "react";
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
import type { Product, ReadingPlanItem } from "@/lib/types";
import { AddEditBookSheet } from "@/components/admin/add-edit-book-sheet";
import { Input } from "@/components/ui/input";
import { useData } from "@/context/data-context";

export default function BooksPage() {
  const { products, addProduct, updateProduct, deleteProduct, readingPlan, updateReadingPlanForProduct, schools, publishers } = useData();

  const [isSheetOpen, setSheetOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Product | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [publisherFilter, setPublisherFilter] = useState("all");

  const bookProducts = useMemo(() => products.filter(p => p.type === 'book'), [products]);

  const filteredProducts = useMemo(() => {
    return bookProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStock = stockFilter === 'all' || product.stockStatus === stockFilter;
      const matchesPublisher = publisherFilter === 'all' || product.publisher === publisherFilter;
      return matchesSearch && matchesStock && matchesPublisher;
    });
  }, [bookProducts, searchQuery, stockFilter, publisherFilter]);

  const handleAddBook = () => {
    setSelectedBook(undefined);
    setSheetOpen(true);
  };

  const handleEditBook = (book: Product) => {
    setSelectedBook(book);
    setSheetOpen(true);
  };

  const handleDeleteBook = (bookId: string) => {
    deleteProduct(bookId);
  };

  const handleSaveChanges = (bookData: Product, newReadingPlan: {schoolId: string, grade: number | string, status: 'mandatory' | 'recommended'}[]) => {
    let book = bookData;
    if (selectedBook) {
      updateProduct(book);
    } else {
      book = addProduct(book);
    }
    updateReadingPlanForProduct(book.id, newReadingPlan);
  };

  const getSchoolAbbreviation = (schoolId: string) => {
    return schools.find(s => s.id === schoolId)?.abbreviation || schoolId;
  }
  
  const getBookReadingPlan = (productId: string) => {
    return readingPlan.filter(item => item.productId === productId);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Livros</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Pesquisar livros..."
                        className="w-full rounded-lg bg-background pl-8 sm:w-[200px] lg:w-[300px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="shrink-0">
                      <Filter className="mr-2" />
                      Filtrar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Filtrar por Stock</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={stockFilter} onValueChange={setStockFilter}>
                        <DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="in_stock">Em Stock</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="out_of_stock">Atraso na Entrega</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="sold_out">Esgotado</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                     <DropdownMenuLabel>Filtrar por Editora</DropdownMenuLabel>
                     <DropdownMenuRadioGroup value={publisherFilter} onValueChange={setPublisherFilter}>
                        <DropdownMenuRadioItem value="all">Todas</DropdownMenuRadioItem>
                        {publishers.map(publisher => (
                            <DropdownMenuRadioItem key={publisher} value={publisher}>{publisher}</DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={handleAddBook} className="shrink-0">
                    <PlusCircle className="mr-2" />
                    Adicionar Novo Livro
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Imagem</span>
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Editora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="hidden md:table-cell">Plano de Leitura</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={product.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.image || 'https://placehold.co/64x64.png'}
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                   <TableCell className="text-muted-foreground">{product.publisher || 'N/A'}</TableCell>
                   <TableCell>
                      <Badge 
                        variant={product.stockStatus === 'sold_out' ? 'destructive' : product.stockStatus === 'out_of_stock' ? 'secondary' : 'default'}
                      >
                         {product.stockStatus === 'sold_out' && 'Esgotado'}
                         {product.stockStatus === 'in_stock' && 'Em Stock'}
                         {product.stockStatus === 'out_of_stock' && 'Atraso na Entrega'}
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
                        <Badge variant="outline">Fora do plano</Badge>
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
                          <span className="sr-only">Alternar menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditBook(product)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteBook(product.id)}
                        >
                          Eliminar
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
        onSaveChanges={handleSaveChanges}
      />
    </>
  );
}
