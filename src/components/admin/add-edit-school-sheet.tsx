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
  FormDescription,
} from "@/components/ui/form";
import type { School } from "@/lib/types";
import { useEffect } from "react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface AddEditSchoolSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  school?: School;
  onSaveChanges: (school: School) => void;
}

const schoolFormSchema = z.object({
  name_pt: z.string().min(3, "O nome da escola deve ter pelo menos 3 caracteres."),
  name_en: z.string().min(3, "The school name must have at least 3 characters."),
  id: z.string().min(3, "O ID deve ter pelo menos 3 caracteres.").regex(/^[a-z0-9-]+$/, "O ID só pode conter letras minúsculas, números e hífenes."),
  abbreviation: z.string().min(2, "A abreviação deve ter pelo menos 2 caracteres.").max(5, "A abreviação não pode ter mais de 5 caracteres.").regex(/^[A-Z0-9]+$/, "A abreviação só pode conter letras maiúsculas e números."),
  allowPickup: z.boolean().default(false),
  allowPickupAtLocation: z.boolean().default(false),
  hasRecommendedPlan: z.boolean().default(false),
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
      name_pt: "",
      name_en: "",
      id: "",
      abbreviation: "",
      allowPickup: false,
      allowPickupAtLocation: false,
      hasRecommendedPlan: false,
    },
  });

  useEffect(() => {
     if (isOpen) {
        if (school) {
        form.reset({
            name_pt: school.name.pt,
            name_en: school.name.en,
            id: school.id,
            abbreviation: school.abbreviation,
            allowPickup: school.allowPickup || false,
            allowPickupAtLocation: school.allowPickupAtLocation || false,
            hasRecommendedPlan: school.hasRecommendedPlan || false,
        });
        } else {
        form.reset({ name_pt: "", name_en: "", id: "", abbreviation: "", allowPickup: false, allowPickupAtLocation: false, hasRecommendedPlan: false });
        }
    }
  }, [school, form, isOpen]);


  const onSubmit = (data: SchoolFormValues) => {
    onSaveChanges({
        id: school?.id || data.id,
        name: { pt: data.name_pt, en: data.name_en },
        abbreviation: data.abbreviation,
        allowPickup: data.allowPickup,
        allowPickupAtLocation: data.allowPickupAtLocation,
        hasRecommendedPlan: data.hasRecommendedPlan,
    });
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
              <div className="space-y-2">
                <Label>Nome da Escola</Label>
                <FormField
                  control={form.control}
                  name="name_pt"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Português" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="name_en"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Inglês" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>ID da Escola</FormLabel>
                        <FormControl>
                        <Input placeholder="ex: escola-luanda" {...field} disabled={!!school} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="abbreviation"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Abreviação</FormLabel>
                        <FormControl>
                        <Input placeholder="ex: EPL" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
               </div>
              
               <FormField
                control={form.control}
                name="allowPickup"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Permitir Levantamento no Colégio</FormLabel>
                       <FormMessage />
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="allowPickupAtLocation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Permitir Levantamento no Local</FormLabel>
                      <FormDescription>
                        Condomínio BCI 6 Casas, Casa No. 6
                      </FormDescription>
                       <FormMessage />
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="hasRecommendedPlan"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Tem Plano de Leitura Recomendado</FormLabel>
                      <FormDescription>
                        Ative se a escola tiver kits recomendados para além dos obrigatórios.
                      </FormDescription>
                       <FormMessage />
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
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
