
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
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
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { products as initialProducts, schools, readingPlan as initialReadingPlan, bookCategories } from "@/lib/data";
import type { Product, ReadingPlanItem, School } from "@/lib/types";
import { AddEditBookSheet } from "@/components/admin/add-edit-book-sheet";
import { Input } from "@/components/ui/input";

export default function BooksPage() {
  const [products, setProducts] = useState<Product[]>(
    initialProducts.filter((p) => p.type === "book")
  );
  const [readingPlan, setReadingPlan] = useState<ReadingPlanItem[]>(initialReadingPlan);

  const [isSheetOpen, setSheetOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Product | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSoldOut, setShowSoldOut] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStock = showSoldOut || product.stockStatus !== 'sold_out';
      return matchesSearch && matchesStock;
    });
  }, [products, searchQuery, showSoldOut]);

  const handleAddBook = () => {
    setSelectedBook(undefined);
    setSheetOpen(true);
  };

  const handleEditBook = (book: Product) => {
    setSelectedBook(book);
    setSheetOpen(true);
  };

  const handleDeleteBook = (bookId: string) => {
    // In a real app, you'd call an API here.
    setProducts(products.filter((p) => p.id !== bookId));
    // Also remove from reading plan
    setReadingPlan(readingPlan.filter(item => item.productId !== bookId));
  };

  const handleSaveChanges = (book: Product, newReadingPlan: {schoolId: string, grade: number, status: 'mandatory' | 'recommended'}[]) => {
    // In a real app, you'd call an API here.
    if (selectedBook) {
      setProducts(products.map((p) => (p.id === book.id ? book : p)));
    } else {
      const newBook = { ...book, id: `book-${Date.now()}` };
      setProducts([...products, newBook ]);
      book.id = newBook.id; // update book id for reading plan
    }

    // Update reading plan
    const otherSchoolsPlan = readingPlan.filter(item => item.productId !== book.id);
    const thisBookPlan: ReadingPlanItem[] = newReadingPlan.map((rp, index) => ({
      id: `rp-${book.id}-${index}-${Date.now()}`,
      productId: book.id,
      schoolId: rp.schoolId,
      grade: rp.grade,
      status: rp.status,
    }));
    setReadingPlan([...otherSchoolsPlan, ...thisBookPlan]);
  };

  const getSchoolName = (schoolId: string) => {
    return schools.find(s => s.id === schoolId)?.name || schoolId;
  }
  
  const getBookReadingPlan = (productId: string) => {
    return readingPlan.filter(item => item.productId === productId);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle>Livros</CardTitle>
                <CardDescription>
                Faça a gestão do catálogo de livros da sua loja.
                </CardDescription>
            </div>
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
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={showSoldOut}
                      onCheckedChange={setShowSoldOut}
                    >
                      Mostrar Esgotados
                    </DropdownMenuCheckboxItem>
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
                <TableHead>Estado</TableHead>
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
                   <TableCell>
                      <Badge 
                        variant={product.stockStatus === 'sold_out' ? 'destructive' : product.stockStatus === 'out_of_stock' ? 'secondary' : 'default'}
                      >
                         {product.stockStatus === 'sold_out' && 'Esgotado'}
                         {product.stockStatus === 'in_stock' && 'Em Stock'}
                         {product.stockStatus === 'out_of_stock' && 'Atraso na Entrega'}
                      </Badge>
                   </TableCell>
                  <TableCell>{product.price.toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {getBookReadingPlan(product.id).length > 0 ? (
                        getBookReadingPlan(product.id).map(item => (
                            <Badge key={item.id} variant={item.status === 'mandatory' ? 'default' : 'secondary'}>
                                {getSchoolName(item.schoolId)} - {item.grade}º Ano ({item.status === 'mandatory' ? 'Obrigatório' : 'Recomendado'})
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
        readingPlan={readingPlan}
      />
    </>
  );
}
