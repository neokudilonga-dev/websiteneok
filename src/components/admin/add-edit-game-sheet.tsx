
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
import { useEffect, useState, ChangeEvent } from "react";
import { PlusCircle, Trash2, Upload } from "lucide-react";
import Image from "next/image";

interface AddEditGameSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  game?: Product;
  onSaveChanges: (game: Product) => void;
}

const gameFormSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  price: z.coerce.number().min(0, "O preço deve ser um número positivo."),
  images: z.array(z.string()).min(1, "Pelo menos uma imagem é obrigatória."),
});

type GameFormValues = z.infer<typeof gameFormSchema>;

export function AddEditGameSheet({
  isOpen,
  setIsOpen,
  game,
  onSaveChanges,
}: AddEditGameSheetProps) {
  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      images: [],
    },
  });

   const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "images",
  });

  useEffect(() => {
    if (isOpen) {
      if (game) {
        form.reset({
          name: game.name,
          description: game.description,
          price: game.price,
          images: game.images || [],
        });
      } else {
        form.reset({
          name: "",
          description: "",
          price: 0,
          images: [],
        });
      }
    }
  }, [game, form, isOpen]);

  const onSubmit = (data: GameFormValues) => {
    onSaveChanges({
      id: game?.id || "",
      type: "game",
      name: data.name,
      description: data.description,
      price: data.price,
      images: data.images,
      image: "",
    });
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
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Mestre do Código" {...field} />
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
                        placeholder="Uma breve descrição do jogo."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="images"
                render={() => (
                  <FormItem>
                    <FormLabel>Imagens do Jogo</FormLabel>
                    <FormDescription>Adicione uma ou mais imagens para o jogo.</FormDescription>
                     <div 
                        className="relative rounded-lg border-2 border-dashed border-input bg-background/50 p-4 transition-colors hover:border-primary"
                        onPaste={handlePaste}
                    >
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="relative aspect-square">
                            <Image src={field.value} alt={`Pré-visualização da imagem ${index+1}`} layout="fill" className="rounded-md object-cover" />
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
