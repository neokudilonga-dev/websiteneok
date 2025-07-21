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
  name: z.string().min(3, "School name must be at least 3 characters."),
  id: z.string().min(3, "ID must be at least 3 characters.").regex(/^[a-z0-9-]+$/, "ID can only contain lowercase letters, numbers, and hyphens."),
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
              <SheetTitle>{school ? "Edit School" : "Add New School"}</SheetTitle>
              <SheetDescription>
                {school
                  ? "Update the details of this school."
                  : "Fill in the details for the new school."}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-4 overflow-y-auto py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g. Escola Primária de Luanda" {...field} />
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
                    <FormLabel>School ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. escola-primaria-luanda" {...field} disabled={!!school} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
