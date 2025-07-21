
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
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import type { Product, ReadingPlanItem } from "@/lib/types";
import { schools } from "@/lib/data";
import { useEffect } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


interface AddEditBookSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  book?: Product;
  onSaveChanges: (book: Product, readingPlan: {schoolId: string, grade: number, status: 'mandatory' | 'recommended'}[]) => void;
  readingPlan: ReadingPlanItem[];
}

const readingPlanItemSchema = z.object({
  schoolId: z.string().min(1, "School is required."),
  grade: z.coerce.number().min(1, "Grade is required.").max(12),
  status: z.enum(["mandatory", "recommended"]),
});

const bookFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  image: z.string().url("Please enter a valid URL."),
  readingPlan: z.array(readingPlanItemSchema).optional(),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

export function AddEditBookSheet({
  isOpen,
  setIsOpen,
  book,
  onSaveChanges,
  readingPlan,
}: AddEditBookSheetProps) {
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image: "",
      readingPlan: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "readingPlan",
  });

  useEffect(() => {
    if (isOpen) {
      if (book) {
        const bookReadingPlan = readingPlan
          .filter(rp => rp.productId === book.id)
          .map(rp => ({ schoolId: rp.schoolId, grade: rp.grade, status: rp.status }));
        
        form.reset({
          name: book.name,
          description: book.description,
          price: book.price,
          image: book.image,
          readingPlan: bookReadingPlan
        });
      } else {
        form.reset({
          name: "",
          description: "",
          price: 0,
          image: "",
          readingPlan: [],
        });
      }
    }
  }, [book, form, isOpen, readingPlan]);


  const onSubmit = (data: BookFormValues) => {
    onSaveChanges({
        id: book?.id || '',
        type: 'book',
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
    }, data.readingPlan || []);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-2xl">
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
            <div className="flex-1 space-y-4 overflow-y-auto py-4 pr-6">
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

              <div>
                <Label>Reading Plan</Label>
                 <FormDescription className="mb-2">
                    Add this book to school reading plans.
                </FormDescription>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col gap-4 rounded-md border p-4">
                        <div className="flex items-end gap-2">
                            <FormField
                                control={form.control}
                                name={`readingPlan.${index}.schoolId`}
                                render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>School</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a school" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {schools.map(school => (
                                        <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`readingPlan.${index}.grade`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Grade</FormLabel>
                                    <FormControl>
                                    <Input type="number" className="w-24" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <FormField
                            control={form.control}
                            name={`readingPlan.${index}.status`}
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>Status</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex items-center space-x-4"
                                    >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="mandatory" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Mandatory</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="recommended" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Recommended</FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ schoolId: '', grade: 1, status: 'mandatory' })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add to Reading Plan
                  </Button>
                </div>
              </div>


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
