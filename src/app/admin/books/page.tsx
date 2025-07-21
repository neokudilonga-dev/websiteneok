"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal } from "lucide-react";
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
import { products as initialProducts } from "@/lib/data";
import type { Product } from "@/lib/types";
import { AddEditBookSheet } from "@/components/admin/add-edit-book-sheet";

export default function BooksPage() {
  const [products, setProducts] = useState<Product[]>(
    initialProducts.filter((p) => p.type === "book")
  );
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Product | undefined>(
    undefined
  );

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
  };

  const handleSaveChanges = (book: Product) => {
    // In a real app, you'd call an API here.
    if (selectedBook) {
      setProducts(products.map((p) => (p.id === book.id ? book : p)));
    } else {
      setProducts([...products, { ...book, id: `book-${Date.now()}` }]);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Books</CardTitle>
            <CardDescription>
              Manage your store's book catalog.
            </CardDescription>
          </div>
          <Button onClick={handleAddBook}>
            <PlusCircle className="mr-2" />
            Add New Book
          </Button>
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
                <TableHead className="hidden md:table-cell">Grade</TableHead>
                <TableHead className="hidden md:table-cell">School</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
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
                    {product.grade}º Ano
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{product.schoolId}</Badge>
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
      />
    </>
  );
}
