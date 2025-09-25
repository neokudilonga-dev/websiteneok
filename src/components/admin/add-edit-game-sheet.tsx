
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
import { useEffect, ChangeEvent, useState } from "react";
import { PlusCircle, Trash2, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { useData } from "@/context/data-context";
import { useLanguage } from "@/context/language-context";

interface AddEditGameSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  game?: Product;
}

const readingPlanItemSchema = z.object({
  schoolId: z.string().min(1, "A escola é obrigatória."),
  grade: z.union([z.coerce.number(), z.string()]).refine(val => val !== '', "O ano é obrigatório."),
  status: z.enum(["mandatory", "recommended"]),
});


const gameFormSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  price: z.coerce.number().min(0, "O preço deve ser um número positivo."),
  stock: z.coerce.number().min(0, "O stock deve ser um número positivo."),
  images: z.array(z.string()).min(1, "Pelo menos uma imagem é obrigatória."),
  stockStatus: z.enum(['in_stock', 'out_of_stock', 'sold_out']),
  readingPlan: z.array(readingPlanItemSchema).optional(),
});

type GameFormValues = z.infer<typeof gameFormSchema>;

export function AddEditGameSheet({
  isOpen,
  setIsOpen,
  game,
}: AddEditGameSheetProps) {
  const { schools, readingPlan, addProduct, updateProduct } = useData();
  const { language } = useLanguage();
  const [asyncError, setAsyncError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      images: [],
      stockStatus: "in_stock",
      readingPlan: [],
    },
  });

  // Remove useFieldArray for images, as images is an array of strings, not a field array object

  const { fields: readingPlanFields, append: appendReadingPlan, remove: removeReadingPlan } = useFieldArray({
    control: form.control,
    name: "readingPlan",
  });

  useEffect(() => {
    if (isOpen) {
      if (game) {
        const gameReadingPlan = readingPlan
          .filter(rp => rp.productId === game.id)
          .map(rp => ({ schoolId: rp.schoolId, grade: rp.grade, status: rp.status }));
        
        form.reset({
          name: typeof game.name === 'object' && game.name !== null
            ? ((game.name as Record<string, string>)[language] ?? (game.name as Record<string, string>).pt ?? "")
            : (typeof game.name === 'string' ? game.name : ""),
          description: typeof game.description === 'object' && game.description !== null
            ? ((game.description as Record<string, string>)[language] ?? (game.description as Record<string, string>).pt ?? "")
            : (typeof game.description === 'string' ? game.description : ""),
          price: game.price,
          stock: game.stock,
          images: game.images || [],
          stockStatus: game.stockStatus || 'in_stock',
          readingPlan: gameReadingPlan,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          price: 0,
          stock: 0,
          images: [],
          stockStatus: "in_stock",
          readingPlan: [],
        });
      }
    }
  }, [game, form, isOpen, readingPlan]);

  const onSubmit = async (data: GameFormValues) => {
    setAsyncError(null);
    setIsSaving(true);
    const productData: Product = {
      id: game?.id || "",
      type: "game",
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      images: data.images,
      stockStatus: data.stockStatus,
      image: "",
    };
    const readingPlanData = data.readingPlan || [];
    try {
      if (game) {
        await updateProduct(productData, readingPlanData);
      } else {
        await addProduct(productData, readingPlanData);
      }
      setIsOpen(false);
    } catch (err: any) {
      setAsyncError(err?.message || "Erro ao guardar alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const currentImages = form.getValues("images") || [];
          form.setValue("images", [...currentImages, base64String]);
        };
        reader.readAsDataURL(file);
      });
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
            const currentImages = form.getValues("images") || [];
            form.setValue("images", [...currentImages, base64String]);
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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-full flex-col"
          >
            <SheetHeader>
              <SheetTitle>{game ? "Editar Jogo" : "Adicionar Novo Jogo"}</SheetTitle>
              <SheetDescription>
                Preencha os detalhes para o novo jogo.
              </SheetDescription>
            </SheetHeader>
            {asyncError && (
              <div className="mb-2 rounded border border-red-500 bg-red-100 px-3 py-2 text-sm text-red-700">
                {asyncError}
              </div>
            )}
            <div className="flex-1 space-y-4 overflow-y-auto py-4 pr-6">
              <div className="space-y-2">
            <Label>Nome do Jogo</Label>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Nome do Jogo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              </div>
              
        <div className="space-y-2">
        <Label>Descrição</Label>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
          <FormItem>
            <FormControl>
            <Textarea placeholder="Descrição do Jogo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
          )}
        />
        </div>

              <FormField
                control={form.control}
                name="images"
                render={() => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel>Imagens do Jogo</FormLabel>
                        <FormDescription>Adicione uma ou mais imagens para o jogo.</FormDescription>
                      </div>
                       <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('image-upload-multiple')?.click()}>
                            <Upload className="mr-2" />
                            Carregar Imagens
                        </Button>
                    </div>
                     <div 
                        className="relative rounded-lg border-2 border-dashed border-input bg-background/50 p-4 transition-colors hover:border-primary"
                        onPaste={handlePaste}
                    >
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {(form.getValues("images") || []).map((img, index) => (
              <div key={img?.substring(0, 32) + '-' + index} className="relative aspect-square">
                {img && <Image src={img} alt={`Pré-visualização da imagem ${index+1}`} layout="fill" className="rounded-md object-cover" />}
                <Button type="button" variant="destructive" size="icon" className="absolute -right-2 -top-2 h-6 w-6 rounded-full" onClick={() => {
                  const currentImages = form.getValues("images") || [];
                  const newImages = [...currentImages.slice(0, index), ...currentImages.slice(index + 1)];
                  form.setValue("images", newImages);
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
                        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-input bg-background/50 text-center transition-colors hover:border-primary">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Carregar</span>
                            <Input 
                                id="image-upload-multiple"
                                type="file" 
                                className="sr-only" 
                                accept="image/*"
                                multiple
                                onChange={(e) => handleImageChange(e)}
                                />
                        </label>
                        </div>
                         <div className="mt-4 text-center text-sm text-muted-foreground">
                            Pode colar imagens aqui
                        </div>
                    </div>
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
                        <FormLabel>Preço</FormLabel>
                        <FormControl>
                        <Input type="number" step="0.01" {...field} />
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
                        <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>

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
                        className="flex items-center space-x-4"
                        >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="in_stock" />
                            </FormControl>
                            <FormLabel className="font-normal">Em Stock</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="out_of_stock" />
                            </FormControl>
                            <FormLabel className="font-normal">Atraso na Entrega</FormLabel>
                        </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
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
                    <Label>Plano de Leitura</Label>
                    <FormDescription className="mb-2">
                        Adicione este item aos planos de leitura das escolas.
                    </FormDescription>
                    <div className="space-y-4">
                    {readingPlanFields.map((field, index) => (
                        <div key={field.id} className="flex flex-col gap-4 rounded-md border p-4">
                            <div className="flex items-end gap-2">
                                <FormField
                                    control={form.control}
                                    name={`readingPlan.${index}.schoolId`}
                                    render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Escola</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma escola" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {schools.map(school => (
                                              <SelectItem key={school.id} value={school.id}>{typeof school.name === 'object' && school.name !== null
                                                ? ((school.name as Record<string, string>)[language] ?? (school.name as Record<string, string>).pt ?? "")
                                                : (typeof school.name === 'string' ? school.name : "")}
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
                                        <FormLabel>Ano/Categoria</FormLabel>
                                        <FormControl>
                                        <Input placeholder="Ex: 1 ou Outros" className="w-28" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeReadingPlan(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <FormField
                                control={form.control}
                                name={`readingPlan.${index}.status`}
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                    <FormLabel>Estado</FormLabel>
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
                                            <FormLabel className="font-normal">Obrigatório</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="recommended" />
                                            </FormControl>
                                            <FormLabel className="font-normal">Recomendado</FormLabel>
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
                        onClick={() => appendReadingPlan({ schoolId: '', grade: '', status: 'mandatory' })}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar ao Plano de Leitura
                    </Button>
                    </div>
                </div>

            </div>
            <SheetFooter className="mt-auto pt-4">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "A guardar..." : "Guardar Alterações"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
