"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Product } from "@/lib/types";
import { schools } from "@/lib/data";
import { useEffect } from "react";

interface AddEditBookSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  book?: Product;
  onSaveChanges: (book: Product) => void;
}

const bookFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  grade: z.coerce.number().min(1, "Grade is required.").max(12),
  schoolId: z.string({ required_error: "Please select a school." }),
  image: z.string().url("Please enter a valid URL."),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

export function AddEditBookSheet({
  isOpen,
  setIsOpen,
  book,
  onSaveChanges,
}: AddEditBookSheetProps) {
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      grade: 1,
      schoolId: "",
      image: "",
    },
  });

  useEffect(() => {
    if (book) {
      form.reset({
        name: book.name,
        description: book.description,
        price: book.price,
        grade: book.grade,
        schoolId: book.schoolId,
        image: book.image,
      });
    } else {
      form.reset();
    }
  }, [book, form, isOpen]);


  const onSubmit = (data: BookFormValues) => {
    onSaveChanges({
        ...data,
        id: book?.id || '',
        type: 'book'
    });
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>{book ? "Edit Book" : "Add New Book"}</SheetTitle>
              <SheetDescription>
                {book
                  ? "Update the details of this book."
                  : "Fill in the details for the new book."}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-4 overflow-y-auto py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g. Math Journey Grade 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A brief description of the book." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://placehold.co/600x400.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                        <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Grade</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
                <FormField
                    control={form.control}
                    name="schoolId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>School</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a school" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {schools.map((school) => (
                                <SelectItem key={school.id} value={school.id}>
                                {school.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <SheetFooter className="mt-auto pt-4">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit">Save Changes</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
