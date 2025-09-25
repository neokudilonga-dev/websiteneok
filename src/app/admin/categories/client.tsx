
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Category } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/context/data-context";
import { useLanguage } from "@/context/language-context";

interface CategoriesPageClientProps {
    initialCategories: Category[];
}

export default function CategoriesPageClient({ initialCategories }: CategoriesPageClientProps) {
  const { categories, addCategory, deleteCategory, setCategories } = useData();
  const { t, language } = useLanguage();
  const [newCategoryNamePT, setNewCategoryNamePT] = useState('');
  const [newCategoryNameEN, setNewCategoryNameEN] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'book' | 'game'>('book');

  useEffect(() => {
    setCategories(initialCategories);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategories]);

  const handleAddCategory = () => {
    if (
      newCategoryNamePT &&
      newCategoryNameEN &&
      !categories.find(
        (c: Category) =>
          c.name.pt.toLowerCase() === newCategoryNamePT.toLowerCase() ||
          c.name.en.toLowerCase() === newCategoryNameEN.toLowerCase()
      )
    ) {
      addCategory({ name: { pt: newCategoryNamePT, en: newCategoryNameEN }, type: newCategoryType });
      setNewCategoryNamePT('');
      setNewCategoryNameEN('');
      setNewCategoryType('book');
    }
  };

  const handleDeleteCategory = (categoryToDelete: { pt: string; en: string }) => {
    deleteCategory(categoryToDelete);
  };


  return (
    <>
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Label>Nome da Categoria (PT)</Label>
          <Input value={newCategoryNamePT} onChange={e => setNewCategoryNamePT(e.target.value)} placeholder="Ex: Biologia" />
        </div>
        <div className="flex-1">
          <Label>Category Name (EN)</Label>
          <Input value={newCategoryNameEN} onChange={e => setNewCategoryNameEN(e.target.value)} placeholder="Ex: Biology" />
        </div>
        <div className="flex-1">
          <Label>{t('categories_page.category_type') || 'Tipo'}</Label>
          <RadioGroup value={newCategoryType} onValueChange={v => setNewCategoryType(v as 'book' | 'game')} className="flex flex-row gap-2 mt-2">
            <RadioGroupItem value="book" id="book" />
            <Label htmlFor="book">{t('common.book') || 'Livro'}</Label>
            <RadioGroupItem value="game" id="game" />
            <Label htmlFor="game">{t('common.game') || 'Jogo'}</Label>
          </RadioGroup>
        </div>
        <Button onClick={handleAddCategory} className="self-end" disabled={!newCategoryNamePT || !newCategoryNameEN}>
          <PlusCircle className="mr-2" />
          {t('categories_page.add_category') || 'Adicionar Categoria'}
        </Button>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>{t('categories_page.title')}</CardTitle>
            <CardDescription>{t('categories_page.description')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('categories_page.category_name')} (PT)</TableHead>
                <TableHead>{t('categories_page.category_name')} (EN)</TableHead>
                <TableHead>{t('common.type')}</TableHead>
                <TableHead className="w-[100px] text-right">
                  <span className="sr-only">{t('common.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhuma categoria cadastrada ainda.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category: Category, idx: number) => {
                  let pt = '-';
                  let en = '-';
                  if (typeof category.name === 'string') {
                    pt = String(category.name).trim() || '-';
                    en = '';
                  } else if (typeof category.name === 'object' && category.name !== null) {
                    pt = String(category.name.pt).trim() || '-';
                    en = String(category.name.en).trim() || '-';
                  }
                  const type = category.type || '';
                  let key = `${pt}_${en}_${type}`;
                  // If the composite key is empty or not unique, use the index as a fallback
                  if (!pt && !en && !type) key = `category_${idx}`;
                  else if (categories.findIndex((c: Category) => `${(c.name?.pt ?? '')}_${(c.name?.en ?? '')}_${c.type || ''}` === key) !== idx) key = `category_${idx}`;
                  return (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{pt}</TableCell>
                      <TableCell className="font-medium">{en}</TableCell>
                      <TableCell>
                        <Badge variant={category.type === 'book' ? 'secondary' : 'default'}>
                          {category.type === 'book' ? t('common.book') : t('common.game')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">{t('categories_page.delete_category')}</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('common.action_cannot_be_undone_category')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCategory(category.name)} className="bg-destructive hover:bg-destructive/90">{t('common.delete')}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

