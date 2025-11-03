
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
import { useEffect, useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useData } from "@/context/data-context";
import { useLanguage } from "@/context/language-context";
import { getDisplayName } from "@/lib/utils";
import { ImageUpload } from "@/components/admin/image-upload";

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


const gameBaseSchema = z.object({
  name: z.union([
    z.string().min(1, "O nome é obrigatório."),
    z.object({
      pt: z.string().min(1, "O nome em Português é obrigatório."),
      en: z.string().min(1, "O nome em Inglês é obrigatório."),
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
  stockStatus: z.enum(['in_stock', 'out_of_stock', 'sold_out']),
  image: z.union([z.string(), z.array(z.string())]).optional(),
  readingPlan: z.array(readingPlanItemSchema).optional(),
});

const gameCreateSchema = gameBaseSchema.extend({
  image: z.union([
    z.string().min(1, "A imagem é obrigatória."),
    z.array(z.string()).min(1, "A imagem é obrigatória."),
  ]),
});

type GameFormValues = z.infer<typeof gameBaseSchema>;

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
    resolver: zodResolver(gameBaseSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      stockStatus: "in_stock",
      image: [],
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
        form.reset({
          name: typeof game.name === 'string' ? game.name : game.name?.[language] || game.name?.pt || "",
          description: typeof game.description === 'string' ? game.description : game.description?.[language] || game.description?.pt || "",
          price: game.price,
          stock: game.stock,
          stockStatus: game.stockStatus || 'in_stock',
          image: game.image || [],
          readingPlan: readingPlan,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          price: 0,
          stock: 0,
          stockStatus: "in_stock",
          image: [],
          readingPlan: [],
        });
      }
    }
  }, [game, form, isOpen, readingPlan, language]);

  const onSubmit = async (data: GameFormValues) => {
    setAsyncError(null);
    setIsSaving(true);

    // Enforce image required only on create
    if (!game) {
      try {
        gameCreateSchema.parse(data as any);
      } catch (e) {
        form.setError('image' as any, { type: 'manual', message: "A imagem é obrigatória." });
        setIsSaving(false);
        return;
      }
    }

    const productData: Product = {
      id: game?.id || (typeof data.name === 'string' ? data.name : data.name?.pt || "") || "", // Ensure ID is string
      type: "game",
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      stockStatus: data.stockStatus,
      image: (data as any).image,
    };
    const readingPlanData = data.readingPlan || [];
    try {
      if (game) {
        await updateProduct(game.id, productData);
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
            <div className="flex-1 space-y-4 py-4 overflow-y-auto">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Jogo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do Jogo"
                        value={typeof field.value === 'string' ? field.value : field.value?.[language] || ''}
                        onChange={(e) => {
                          if (typeof field.value === 'string') {
                            field.onChange(e.target.value);
                          } else {
                            field.onChange({ ...field.value, [language]: e.target.value });
                          }
                        }}
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
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição do Jogo"
                        value={typeof field.value === 'string' ? field.value : field.value?.[language] || ''}
                        onChange={(e) => {
                          if (typeof field.value === 'string') {
                            field.onChange(e.target.value);
                          } else {
                            field.onChange({ ...field.value, [language]: e.target.value });
                          }
                        }}
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
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <ImageUpload label="Imagens" value={field.value as any} onChange={field.onChange as any} folder="games" multiple />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <h3 className="mb-4 text-lg font-medium">Plano de Leitura</h3>
                {readingPlanFields.map((item, index) => (
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
                              {schools.map((school) => {
                                return (
                                  <SelectItem key={school.id} value={school.id}>
                                    {getDisplayName(school.name, language)}
                                  </SelectItem>
                                );
                              })}
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
                          <FormControl>
                            <Input placeholder="Ano (ex: 1, 2, Iniciação)" {...field} />
                          </FormControl>
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
                        onClick={() => removeReadingPlan(index)}
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
                  onClick={() => appendReadingPlan({ schoolId: "", grade: "", status: "mandatory" })}
                  className="w-full"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item ao Plano de Leitura
                </Button>
              </div>
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
