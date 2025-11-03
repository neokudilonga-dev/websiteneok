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
} from "@/components/ui/form";
import type { Product } from "@/lib/types";
import { useEffect, useState, useMemo } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useData } from "@/context/data-context";
import { useLanguage } from "@/context/language-context";
import { getDisplayName } from "@/lib/utils";
import { ImageUpload } from "@/components/admin/image-upload";

const readingPlanItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  schoolId: z.string().min(1, "A escola é obrigatória."),
  grade: z.union([z.coerce.number(), z.string()]).refine(val => val !== '', "O ano é obrigatório."),
  status: z.enum(["mandatory", "recommended"]),
});

const bookBaseSchema = z.object({
  name: z.union([
    z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    z.object({
      pt: z.string().min(3, "O nome em Português deve ter pelo menos 3 caracteres."),
      en: z.string().min(3, "O nome em Inglês deve ter pelo menos 3 caracteres."),
    }),
  ]).optional(),
  description: z.union([
    z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
    z.object({
      pt: z.string().min(10, "A descrição em Português deve ter pelo menos 10 caracteres."),
      en: z.string().min(10, "A descrição em Inglês deve ter pelo menos 10 caracteres."),
    }),
  ]),
  price: z.coerce.number().min(0, "O preço deve ser um número positivo."),
  stock: z.coerce.number().min(0, "O stock deve ser um número positivo."),
  category: z.string().min(1, "A categoria é obrigatória."),
  publisher: z.string().optional(),
  stockStatus: z.enum(['in_stock', 'out_of_stock', 'sold_out']),
  image: z.union([z.string(), z.array(z.string())]).optional(),
  readingPlan: z.array(readingPlanItemSchema).optional(),
});

const bookCreateSchema = bookBaseSchema.extend({
  image: z.union([
    z.string().min(1, "A imagem é obrigatória."),
    z.array(z.string()).min(1, "A imagem é obrigatória."),
  ]),
});

type BookFormValues = z.infer<typeof bookBaseSchema>;

interface AddEditBookSheetProps {
  book?: Product;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onBookSaved: (updatedBook?: Product) => void;
}

export const AddEditBookSheet: React.FC<AddEditBookSheetProps> = ({ book, isOpen, setIsOpen, onBookSaved }) => {
  const { language } = useLanguage();
  const { schools, addProduct, updateProduct, categories, publishers, readingPlan, setCategories } = useData();
  const { t } = useLanguage();
  const [asyncError, setAsyncError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const bookCategories = useMemo(() => categories.filter(c => c.type === 'book'), [categories]);

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookBaseSchema),
    defaultValues: {
      name: { pt: "", en: "" },
      description: "",
      price: 0,
      stock: 0,
      category: "",
      publisher: "",
      stockStatus: 'in_stock',
      image: "",
      readingPlan: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "readingPlan",
  });

  useEffect(() => {
    const fetchCategoriesIfNeeded = async () => {
      if (isOpen && categories.length === 0) {
        try {
          const res = await fetch('/api/categories');
          if (res.ok) {
            const data = await res.json();
            setCategories(data);
          }
        } catch {
          // ignore
        }
      }
    };
    fetchCategoriesIfNeeded();
    if (isOpen) {
      if (book) {
        const bookReadingPlan = readingPlan
          .filter((rp: any) => rp.productId === book.id)
          .map((rp: any) => ({
            id: rp.id || "",
            productId: rp.productId || "",
            schoolId: rp.schoolId,
            grade: rp.grade,
            status: rp.status,
          }));
        form.reset({
          name: typeof book.name === 'string' ? book.name : (book.name || { pt: "", en: "" }),
          description: typeof book.description === 'string' ? book.description : (book.description || { pt: "", en: "" }),
          price: book.price,
          stock: book.stock,
          category: book.category,
          publisher: book.publisher,
          stockStatus: book.stockStatus || 'in_stock',
          image: book.image,
          readingPlan: bookReadingPlan
        });
      } else {
        form.reset({
          name: { pt: "", en: "" },
          description: "",
          price: 0,
          stock: 0,
          category: "",
          publisher: "",
          stockStatus: "in_stock",
          readingPlan: [],
        });
      }
    }
  }, [book, form, isOpen, readingPlan, categories.length, setCategories]);

  const onSubmit = async (data: BookFormValues) => {
    console.log("onSubmit called with data:", data);
    setAsyncError(null);
    setIsSaving(true);

    // Enforce image required only on create
    if (!book) {
      try {
        bookCreateSchema.parse(data as any);
      } catch (e) {
        form.setError('image' as any, { type: 'manual', message: "A imagem é obrigatória." });
        setIsSaving(false);
        return;
      }
    }

    try {
      const productData: Product = {
        id: book?.id || "",
        name: typeof data.name === 'string' ? data.name : (data.name || { pt: '', en: '' }),
        description: typeof data.description === 'string' ? data.description : (data.description || { pt: '', en: '' }),
        price: data.price,
        stock: data.stock,
        type: "book",
        category: data.category,
        publisher: data.publisher,
        stockStatus: data.stockStatus,
        image: data.image,
        readingPlan: data.readingPlan?.map((rp) => ({
          id: rp.id || "",
          productId: rp.productId || "",
          schoolId: rp.schoolId,
          grade: rp.grade,
          status: rp.status,
        })) || [],
      };

      if (book) {
        // Update existing book
        await updateProduct(book.id, productData);
        onBookSaved({ ...book, ...productData });
      } else {
        // Add new book
        const newBook = await addProduct(productData, productData.readingPlan || []);
        onBookSaved(newBook);
      }
      setIsOpen(false);
    } catch (error: any) {
      console.error("Failed to save book:", error);
      setAsyncError(error.message || "Failed to save book.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-[600px] w-full">
        <SheetHeader>
          <SheetTitle>{book ? t('books_page.edit_book') : t('books_page.add_new_book')}</SheetTitle>
          <SheetDescription>
            {book ? t('books_page.edit_book_description') : t('books_page.add_new_book_description')}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('books_page.name')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('books_page.name_placeholder')}
                      value={typeof field.value === 'string' ? field.value : (field.value?.[language] || '')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        field.onChange(
                          typeof field.value === 'string'
                            ? e.target.value
                            : {
                                ...field.value,
                                [language]: e.target.value,
                              }
                        )
                      }
                    />
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
                  <FormLabel>{t('common.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('books_page.description_placeholder')}
                      value={typeof field.value === 'string' ? field.value : (field.value?.[language] || '')}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        field.onChange(
                          typeof field.value === 'string'
                            ? e.target.value
                            : {
                                ...field.value,
                                [language]: e.target.value,
                              }
                        )
                      }
                    />
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
                  <FormLabel>{t('common.price')}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.stock')}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.category')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('books_page.select_category')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bookCategories.map((category) => (
                        <SelectItem key={getDisplayName(category.name, language)} value={typeof category.name === 'string' ? category.name : category.name.pt}>
                          {getDisplayName(category.name, language)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="publisher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.publisher')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('books_page.select_publisher')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {publishers.map((publisher) => (
                        <SelectItem key={publisher} value={publisher}>
                          {publisher}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stockStatus"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('common.stock_status')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="in_stock" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t('stock_status.in_stock')}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="out_of_stock" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t('stock_status.out_of_stock')}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="sold_out" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {t('stock_status.sold_out')}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
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
                  <ImageUpload label="Imagem" value={field.value} onChange={field.onChange} folder="books" multiple={false} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Label>{t('books_page.reading_plan')}</Label>
              {fields.map((item, index) => (
                <div key={item.id} className="flex space-x-2 mt-2">
                  <FormField
                    control={form.control}
                    name={`readingPlan.${index}.schoolId`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('books_page.select_school')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {schools.map((school) => (
                              <SelectItem key={school.id} value={school.id}>
                                {getDisplayName(school.name, language)}
                              </SelectItem>
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
                      <FormItem className="flex-1">
                        <Input type="number" placeholder={t('books_page.grade')} {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`readingPlan.${index}.status`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('books_page.select_status')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mandatory">{t('books_page.mandatory')}</SelectItem>
                            <SelectItem value="recommended">{t('books_page.recommended')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="destructive" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" className="mt-2" onClick={() => append({ schoolId: "", grade: "", status: "mandatory" } as any)}>
                <PlusCircle className="mr-2" />
                {t('books_page.add_to_reading_plan')}
              </Button>
            </div>
            {asyncError && <p className="text-red-500 text-sm">{asyncError}</p>}
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  {t('common.cancel')}
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? t('common.saving') : t('common.save_changes')}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}


