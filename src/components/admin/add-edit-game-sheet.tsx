
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
import { useEffect, ChangeEvent } from "react";
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

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      name_pt: "",
      name_en: "",
      description_pt: "",
      description_en: "",
      price: 0,
      stock: 0,
      images: [],
      stockStatus: "in_stock",
      readingPlan: [],
    },
  });

   const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "images",
  });

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
          name_pt: game.name.pt,
          name_en: game.name.en,
          description_pt: game.description.pt,
          description_en: game.description.en,
          price: game.price,
          stock: game.stock,
          images: game.images || [],
          stockStatus: game.stockStatus || 'in_stock',
          readingPlan: gameReadingPlan,
        });
      } else {
        form.reset({
          name_pt: "",
          name_en: "",
          description_pt: "",
          description_en: "",
          price: 0,
          stock: 0,
          images: [],
          stockStatus: "in_stock",
          readingPlan: [],
        });
      }
    }
  }, [game, form, isOpen, readingPlan]);

  const onSubmit = (data: GameFormValues) => {
    const productData: Product = {
      id: game?.id || "",
      type: "game",
      name: { pt: data.name_pt, en: data.name_en },
      description: { pt: data.description_pt, en: data.description_en },
      price: data.price,
      stock: data.stock,
      images: data.images,
      stockStatus: data.stockStatus,
      image: "",
    };
    
    const readingPlanData = data.readingPlan || [];
    
    if (game) {
        updateProduct(productData, readingPlanData);
    } else {
        addProduct(productData, readingPlanData);
    }
    
    setIsOpen(false);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>, indexToUpdate?: number) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          if(indexToUpdate !== undefined) {
             update(indexToUpdate, base64String);
          } else {
             append(base64String);
          }
        };
        reader.readAsDataURL(file);
      })
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
                    append(base64String);
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
                        {fields.map((field, index) => (
                            <div key={field.id} className="relative aspect-square">
                            {field.value && <Image src={field.value} alt={`Pré-visualização da imagem ${index+1}`} layout="fill" className="rounded-md object-cover" />}
                            <Button type="button" variant="destructive" size="icon" className="absolute -right-2 -top-2 h-6 w-6 rounded-full" onClick={() => remove(index)}>
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
                                            <SelectItem key={school.id} value={school.id}>{school.name[language] || school.name.pt}</SelectItem>
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
              <Button type="submit">Guardar Alterações</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
