
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
import { PlusCircle, MoreHorizontal, Search } from "lucide-react";
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
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { products as initialProducts, schools, readingPlan as initialReadingPlan } from "@/lib/data";
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

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

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

  const handleSaveChanges = (book: Product, newReadingPlan: {schoolId: string, grade: number}[]) => {
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
      grade: rp.grade
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
                <CardTitle>Books</CardTitle>
                <CardDescription>
                Manage your store's book catalog.
                </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search books..."
                        className="w-full rounded-lg bg-background pl-8 sm:w-[200px] lg:w-[300px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button onClick={handleAddBook} className="shrink-0">
                    <PlusCircle className="mr-2" />
                    Add New Book
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden md:table-cell">Reading Plan</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
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
                      src={product.image}
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {getBookReadingPlan(product.id).length > 0 ? (
                        getBookReadingPlan(product.id).map(item => (
                            <Badge key={item.id} variant="outline">
                                {getSchoolName(item.schoolId)} - {item.grade}º Ano
                            </Badge>
                        ))
                      ): (
                        <Badge variant="secondary">Not in a plan</Badge>
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
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditBook(product)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteBook(product.id)}
                        >
                          Delete
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
