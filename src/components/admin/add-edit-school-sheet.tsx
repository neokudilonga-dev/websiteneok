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
import type { School } from "@/lib/types";
import { useEffect } from "react";

interface AddEditSchoolSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  school?: School;
  onSaveChanges: (school: School) => void;
}

const schoolFormSchema = z.object({
  name: z.string().min(3, "O nome da escola deve ter pelo menos 3 caracteres."),
  id: z.string().min(3, "O ID deve ter pelo menos 3 caracteres.").regex(/^[a-z0-9-]+$/, "O ID só pode conter letras minúsculas, números e hífenes."),
});

type SchoolFormValues = z.infer<typeof schoolFormSchema>;

export function AddEditSchoolSheet({
  isOpen,
  setIsOpen,
  school,
  onSaveChanges,
}: AddEditSchoolSheetProps) {
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: {
      name: "",
      id: "",
    },
  });

  useEffect(() => {
     if (isOpen) {
        if (school) {
        form.reset({
            name: school.name,
            id: school.id,
        });
        } else {
        form.reset({ name: "", id: "" });
        }
    }
  }, [school, form, isOpen]);


  const onSubmit = (data: SchoolFormValues) => {
    onSaveChanges(data);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>{school ? "Editar Escola" : "Adicionar Nova Escola"}</SheetTitle>
              <SheetDescription>
                {school
                  ? "Atualize os detalhes desta escola."
                  : "Preencha os detalhes para a nova escola."}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-4 overflow-y-auto py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Escola</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Escola Primária de Luanda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID da Escola</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: escola-primaria-luanda" {...field} disabled={!!school} />
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
