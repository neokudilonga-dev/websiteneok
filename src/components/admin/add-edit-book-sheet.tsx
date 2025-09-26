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
import type { Product } from "@/lib/types";
import { useEffect, useState, ChangeEvent, useMemo } from "react";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from "@/lib/firebase";
import { PlusCircle, Trash2, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { useData } from "@/context/data-context";
import { useLanguage } from "@/context/language-context";
import imageCompression from 'browser-image-compression';


interface AddEditBookSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  book?: Product;
  onBookSaved: (updatedBook?: Product, oldImageUrl?: string) => void;
}

const readingPlanItemSchema = z.object({
  schoolId: z.string().min(1, "A escola é obrigatória."),
  grade: z.union([z.coerce.number(), z.string()]).refine(val => val !== '', "O ano é obrigatório."),
  status: z.enum(["mandatory", "recommended"]),
});

const bookFormSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."), // Reverted: name is required and user-provided
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  price: z.coerce.number().min(0, "O preço deve ser um número positivo."),
  stock: z.coerce.number().min(0, "O stock deve ser um número positivo."),
  image: z.string().min(1, "A imagem é obrigatória."),
  category: z.string().min(1, "A categoria é obrigatória."), // Will store the i18n name
  publisher: z.string().optional(),
  stockStatus: z.enum(['in_stock', 'out_of_stock', 'sold_out']),
  readingPlan: z.array(readingPlanItemSchema).optional(),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

export function AddEditBookSheet({
  isOpen,
  setIsOpen,
  book,
  onBookSaved,
}: AddEditBookSheetProps) {
  const { schools, categories, publishers, readingPlan, addProduct, updateProduct, setCategories } = useData();
  const { language } = useLanguage();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [asyncError, setAsyncError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const bookCategories = useMemo(() => categories.filter(c => c.type === 'book'), [categories]);

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      name: "", // Reverted: name is user-provided
      description: "",
      price: 0,
      stock: 0,
      image: "",
      category: "",
      publisher: "",
      stockStatus: 'in_stock',
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
        } catch (e) {
          // ignore
        }
      }
    };
    fetchCategoriesIfNeeded();
    if (isOpen) {
      if (book) {
        const bookReadingPlan = readingPlan
          .filter((rp: any) => rp.productId === book.id)
          .map((rp: any) => ({ schoolId: rp.schoolId, grade: rp.grade, status: rp.status }));
        form.reset({
          name: book.name, // Reverted: name is user-provided
          description: book.description,
          price: book.price,
          stock: book.stock,
          image: book.image,
          category: book.category,
          publisher: book.publisher,
          stockStatus: book.stockStatus || 'in_stock',
          readingPlan: bookReadingPlan
        });
        setImagePreview(book.image);
        setImageFile(null); // Clear image file on edit
      } else {
        form.reset({
          name: "", // Reverted: name is user-provided
          description: "",
          price: 0,
          stock: 0,
          image: "",
          category: "",
          publisher: "",
          stockStatus: "in_stock",
          readingPlan: [],
        });
        setImagePreview(null);
        setImageFile(null);
      }
    }
  }, [book, form, isOpen, readingPlan, categories.length, setCategories]);

  const uploadImage = async (file: File): Promise<string> => {
    setIsSaving(true);
    setAsyncError(null);

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1, // (max file size in MB)
        maxWidthOrHeight: 1920, // (max width or height in pixels)
        useWebWorker: true,
      });

      const fileName = `products/${Date.now()}_${compressedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storage = getStorage(app);
      const fileRef = storageRef(storage, fileName);

      const metadata = {
        contentType: compressedFile.type,
        customMetadata: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      };

      const snapshot = await uploadBytes(fileRef, compressedFile, metadata);
      const url = await getDownloadURL(snapshot.ref);
      return `${url}?alt=media&t=${Date.now()}`;
    } catch (error: any) {
      console.error("Image upload failed:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (data: BookFormValues) => {
    setAsyncError(null);
    setIsSaving(true);

    let imageUrl = book?.image || "";
    let oldImageUrl: string | undefined = undefined;

    if (imageFile) {
      try {
        if (book?.image) {
          oldImageUrl = book.image;
        }
        imageUrl = await uploadImage(imageFile);
      } catch (error: any) {
        setAsyncError(error.message);
        setIsSaving(false);
        return;
      }
    }

    const productData: Product = {
      id: book?.id || data.name, // Use book ID if editing, otherwise use name as ID
      type: 'book',
      name: data.name, // Reverted: name is user-provided
      description: data.description,
      price: data.price,
      stock: data.stock,
      image: imageUrl,
      images: [],
      category: data.category,
      publisher: data.publisher,
      stockStatus: data.stockStatus,
    };
    const readingPlanData = data.readingPlan?.map(rp => ({
      productId: book?.id || data.name,
      schoolId: rp.schoolId,
      grade: typeof rp.grade === 'string' ? rp.grade : String(rp.grade),
      status: rp.status
    })) || [];
    try {
      if (book) {
        await updateProduct(productData, readingPlanData);
      } else {
        await addProduct(productData, readingPlanData);
      }
      setIsOpen(false);
      onBookSaved(productData, oldImageUrl);
    } catch (err: any) {
      setAsyncError(err?.message || "Erro ao guardar alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };
  
    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      
      console.log("Image selected:", file.name);
    } catch (error: any) {
      console.error("Image selection failed:", error);
      setAsyncError(`Failed to select image: ${error.message}`);
      alert(`Failed to select image: ${error.message}`);
    }
  };

    const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
        try {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type && items[i].type.indexOf("image") !== -1) {
                    const file = items[i].getAsFile();
                    if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                        console.log("Pasted image selected.");
                        return; // Exit after handling the first image
                    }
                }
            }
        } catch (error: any) {
            console.error("Pasted image selection failed:", error);
            setAsyncError(`Failed to select pasted image: ${error.message}`);
            alert(`Failed to select pasted image: ${error.message}`);
        }
    };

  const deleteImage = async (imageUrl: string) => {
    try {
      const storage = getStorage(app);
      const imageRef = storageRef(storage, imageUrl);
      await deleteObject(imageRef);
      console.log("Old image deleted successfully:", imageUrl);
    } catch (error: any) {
      console.error("Failed to delete old image:", error);
      // Don't block the main process if old image deletion fails
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    form.setValue("image", "");
  };

  useEffect(() => {
    if (!isOpen) {
      // When the sheet closes, reset the form and image states
      form.reset();
      setImagePreview(null);
      setImageFile(null);
      setAsyncError(null);
      setIsSaving(false);
    }
  }, [isOpen, form]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-[600px] w-full flex flex-col">
        <SheetHeader>
          <SheetTitle>{book ? "Editar Livro" : "Adicionar Novo Livro"}</SheetTitle>
          <SheetDescription>
            {book ? "Edite os detalhes do livro existente." : "Adicione um novo livro ao catálogo."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 flex-grow overflow-y-auto">
            {asyncError && (
              <div className="text-red-500 text-sm text-center">{asyncError}</div>
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Livro</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do Livro" {...field} />
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
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição do Livro" {...field} />
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
                  <FormLabel>Preço</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
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
                  <FormLabel>Imagem do Livro</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mb-2"
                      />
                      {imagePreview && (
                        <div className="relative w-32 h-32 mb-2">
                          <Image
                            src={imagePreview}
                            alt="Image Preview"
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={handleRemoveImage}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" /> Selecionar Imagem
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Selecione ou cole uma imagem para o livro.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bookCategories.map((cat) => (
                        <SelectItem key={cat.name.en} value={cat.name[language as keyof typeof cat.name]}>
                          {cat.name[language as keyof typeof cat.name]}
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
                  <FormLabel>Editora</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma editora (Opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {publishers.map((pub) => (
                        <SelectItem key={pub} value={pub}>
                          {pub}
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
                  <FormLabel>Estado do Stock</FormLabel>
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
                        <FormLabel className="font-normal">Em Stock</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="out_of_stock" />
                        </FormControl>
                        <FormLabel className="font-normal">Sem Stock</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="sold_out" />
                        </FormControl>
                        <FormLabel className="font-normal">Esgotado</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <h3 className="mb-4 text-lg font-medium">Plano de Leitura</h3>
              {fields.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-md">
                  <FormField
                    control={form.control}
                    name={`readingPlan.${index}.schoolId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Escola</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a escola" />
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
                  <FormField
                    control={form.control}
                    name={`readingPlan.${index}.grade`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o ano" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                              <SelectItem key={grade} value={String(grade)}>
                                {grade}º Ano
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
                    name={`readingPlan.${index}.status`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mandatory">Obrigatório</SelectItem>
                            <SelectItem value="recommended">Recomendado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                      className="self-end"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ schoolId: "", grade: "", status: "mandatory" })}
                className="w-full"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item ao Plano de Leitura
              </Button>
            </div>
            <SheetFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "A Guardar..." : "Guardar Alterações"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}


