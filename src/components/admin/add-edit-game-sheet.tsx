
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
import { useEffect, useState, useMemo } from "react";
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
  grade: z.union([z.coerce.number(), z.string()]).refine(val => {
    const s = String(val);
    if (s === '') return false;
    // Permite números simples ou intervalos como 7-9
    return /^\d+(-\d+)?$/.test(s);
  }, "O ano deve ser um número ou intervalo (ex: 7-9)."),
  status: z.enum(["mandatory", "recommended", "didactic_aids"]),
});


const gameBaseSchema = z.object({
  name: z.union([
    z.string().min(1, "O nome é obrigatório."),
    z.object({
      pt: z.string().optional(),
      en: z.string().optional(),
    }).refine(data => {
      const ptValid = data.pt && data.pt.trim().length >= 1;
      const enValid = data.en && data.en.trim().length >= 1;
      return ptValid || enValid;
    }, {
      message: "O nome deve ter pelo menos 1 caractere em pelo menos um idioma.",
      path: ["pt"]
    }),
  ]),
  description: z.union([
    z.string(),
    z.object({
      pt: z.string().optional(),
      en: z.string().optional(),
    }),
  ]).optional(),
  price: z.coerce.number().min(0, "O preço deve ser um número positivo."),
  stock: z.coerce.number().min(0, "O stock deve ser um número positivo."),
  stockStatus: z.enum(['in_stock', 'out_of_stock', 'sold_out']),
  storagePlace: z.string().length(3).regex(/^[A-Za-z]\d{2}$/, 'Must be Letter + 2 numbers').optional().or(z.literal('')),
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
  const { schools, readingPlan, addProduct, updateProduct, products } = useData();
  const { language, t } = useLanguage();
  const [asyncError, setAsyncError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const gameReadingPlan = useMemo(() => {
    if (!game) return [];
    return readingPlan.filter(rp => rp.productId === game.id);
  }, [game, readingPlan]);

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameBaseSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      stockStatus: "in_stock",
      storagePlace: "",
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
          storagePlace: game.storagePlace || "",
          image: game.image || [],
          readingPlan: gameReadingPlan as any,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          price: 0,
          stock: 0,
          stockStatus: "in_stock",
          storagePlace: "",
          image: [],
          readingPlan: [],
        });
      }
    }
  }, [game, form, isOpen, gameReadingPlan, language]);

  const mapGradeToCycle = (grade: string | number, status: string) => {
    if (status !== 'didactic_aids') return grade;
    const g = String(grade).replace(/[^0-9]/g, '');
    const n = parseInt(g);
    if (n === 1) return '1-4';
    if (n === 2) return '5-9';
    if (n === 3) return '10-12';
    return 'didactic_aids';
  };

  const onSubmit = async (data: GameFormValues) => {
    setAsyncError(null);
    setIsSaving(true);

    // Duplicate title check for games
    const currentNamePt = (typeof data.name === 'object' ? data.name?.pt : data.name)?.trim().toLowerCase();
    const currentNameEn = (typeof data.name === 'object' ? data.name?.en : data.name)?.trim().toLowerCase();

    const isDuplicate = products.some(p => {
      if (game && p.id === game.id) return false;
      if (p.type !== 'game') return false;

      const pNamePt = (typeof p.name === 'object' ? p.name?.pt : p.name)?.trim().toLowerCase();
      const pNameEn = (typeof p.name === 'object' ? p.name?.en : p.name)?.trim().toLowerCase();

      // Check if either PT or EN names match (if they are provided)
      const ptMatch = currentNamePt && pNamePt && currentNamePt === pNamePt;
      const enMatch = currentNameEn && pNameEn && currentNameEn === pNameEn;

      return ptMatch || enMatch;
    });

    if (isDuplicate) {
      form.setError('name' as any, { 
        type: 'manual', 
        message: "Já existe um jogo/item com este nome (em Português ou Inglês)." 
      });
      setIsSaving(false);
      return;
    }

    // Enforce image required only on create
    if (!game) {
      try {
        gameCreateSchema.parse(data as any);
      } catch {
        form.setError('image' as any, { type: 'manual', message: "A imagem é obrigatória." });
        setIsSaving(false);
        return;
      }
    }

    const productData: Product = {
      id: game?.id || "", 
      type: "game",
      name: data.name as any,
      description: data.description as any,
      price: data.price,
      stock: data.stock,
      stockStatus: data.stockStatus,
      storagePlace: data.storagePlace,
      image: (data as any).image,
      readingPlan: data.readingPlan?.map((rp: any) => ({
        id: rp.id || "",
        productId: rp.productId || "",
        schoolId: rp.schoolId,
        grade: mapGradeToCycle(rp.grade, rp.status),
        status: rp.status as "mandatory" | "recommended" | "didactic_aids",
      })) || [],
    };

    try {
      if (game) {
        await updateProduct(game.id, productData);
      } else {
        await addProduct(productData, productData.readingPlan || []);
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
              <SheetTitle>{game ? t('games_page.edit_game') : t('games_page.add_new_game')}</SheetTitle>
              <SheetDescription>
                {t('games_page.add_new_game_description')}
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
                    <FormLabel>{t('games_page.name')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('games_page.name_placeholder')}
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
                    <FormLabel>{t('games_page.description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('games_page.description_placeholder')}
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
                    <FormLabel>{t('common.price')}</FormLabel>
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
                    <FormLabel>{t('common.stock')}</FormLabel>
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
                          <FormLabel className="font-normal">{t('stock_status.in_stock')}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="out_of_stock" />
                          </FormControl>
                          <FormLabel className="font-normal">{t('stock_status.out_of_stock')}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="sold_out" />
                          </FormControl>
                          <FormLabel className="font-normal">{t('stock_status.sold_out')}</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="storagePlace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.storage_place')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: A01" {...field} />
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
                    <ImageUpload label={t('common.image')} value={field.value as any} onChange={field.onChange as any} folder="products/games" multiple />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <h3 className="mb-4 text-lg font-medium">{t('games_page.reading_plan')}</h3>
                {readingPlanFields.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-md">
                    <FormField
                      control={form.control}
                      name={`readingPlan.${index}.schoolId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('games_page.select_school')}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('games_page.select_school')} />
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
                          <FormLabel>{t('games_page.grade')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('games_page.grade')} 
                              {...field} 
                              onChange={(e) => {
                                const val = e.target.value;
                                const status = form.getValues(`readingPlan.${index}.status`);
                                if (status === 'didactic_aids') {
                                  // Only allow 1, 2, 3 for didactic_aids
                                  if (/^[1-3]?$/.test(val)) {
                                    field.onChange(val);
                                  }
                                } else {
                                  // Allow numbers and hyphens for other statuses
                                  if (/^[\d-]*$/.test(val)) {
                                    field.onChange(val);
                                  }
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
                      name={`readingPlan.${index}.status`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('games_page.select_status')}</FormLabel>
                          <Select 
                            onValueChange={(val) => {
                              field.onChange(val);
                              // If switching to didactic_aids, clear or validate grade
                              if (val === 'didactic_aids') {
                                const currentGrade = form.getValues(`readingPlan.${index}.grade`);
                                if (!/^[1-3]$/.test(String(currentGrade))) {
                                  form.setValue(`readingPlan.${index}.grade`, "");
                                }
                              }
                            }} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('games_page.select_status')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mandatory">{t('games_page.mandatory')}</SelectItem>
                              <SelectItem value="recommended">{t('games_page.recommended')}</SelectItem>
                              <SelectItem value="didactic_aids">{t('games_page.didactic_aids')}</SelectItem>
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
                  <PlusCircle className="mr-2 h-4 w-4" /> {t('games_page.add_to_reading_plan')}
                </Button>
              </div>
            </div>
            <SheetFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4">
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
