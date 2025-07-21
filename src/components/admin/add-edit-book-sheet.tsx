
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
import { useEffect, useState, ChangeEvent } from "react";
import { PlusCircle, Trash2, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";


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
  image: z.string().min(1, "Image is required."),
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
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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
        setImagePreview(book.image);
      } else {
        form.reset({
          name: "",
          description: "",
          price: 0,
          image: "",
          readingPlan: [],
        });
        setImagePreview(null);
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
  
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                form.setValue("image", base64String);
                setImagePreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64String = reader.result as string;
                        form.setValue("image", base64String);
                        setImagePreview(base64String);
                    };
                    reader.readAsDataURL(file);
                }
            }
        }
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
                    <FormLabel
                      className="cursor-pointer"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      Book Cover Image
                    </FormLabel>
                    <FormControl>
                        <div 
                            className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-background/50 p-4 text-center transition-colors hover:border-primary"
                            onPaste={handlePaste}
                        >
                            {imagePreview ? (
                                <Image src={imagePreview} alt="Book cover preview" width={200} height={200} className="mb-4 max-h-48 w-auto rounded-md object-contain" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Upload className="h-8 w-8" />
                                    <p className="font-semibold">Click to upload, or paste an image</p>
                                    <p className="text-xs">PNG, JPG, WEBP recommended</p>
                                </div>
                            )}
                            <Input 
                                id="image-upload" 
                                type="file" 
                                className="sr-only" 
                                accept="image/*"
                                onChange={handleImageChange}
                             />
                        </div>
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
