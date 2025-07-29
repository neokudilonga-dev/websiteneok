
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
  const { t } = useLanguage();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'book' | 'game'>('book');

  useEffect(() => {
    setCategories(initialCategories);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategories]);

  const handleAddCategory = () => {
    if (newCategoryName && !categories.find(c => c.name.toLowerCase() === newCategoryName.toLowerCase())) {
        addCategory({ name: newCategoryName, type: newCategoryType });
        setNewCategoryName('');
        setNewCategoryType('book');
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    deleteCategory(categoryToDelete);
  };


  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>{t('categories_page.title')}</CardTitle>
            <CardDescription>{t('categories_page.description')}</CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    {t('categories_page.add_category')}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>{t('categories_page.dialog_title')}</AlertDialogTitle>
                <AlertDialogDescription>
                    {t('categories_page.dialog_description')}
                </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="category-name">{t('categories_page.category_name')}</Label>
                        <Input 
                            id="category-name"
                            value={newCategoryName} 
                            onChange={(e) => setNewCategoryName(e.target.value)} 
                            placeholder={t('categories_page.category_name_placeholder')}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>{t('categories_page.category_type')}</Label>
                        <RadioGroup defaultValue="book" onValueChange={(value) => setNewCategoryType(value as 'book' | 'game')} value={newCategoryType}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="book" id="r-book" />
                                <Label htmlFor="r-book">{t('common.book')}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="game" id="r-game" />
                                <Label htmlFor="r-game">{t('common.game_and_other')}</Label>
                            </div>
                        </RadioGroup>
                     </div>
                </div>
                <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleAddCategory}>{t('common.add')}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('categories_page.category_name')}</TableHead>
                <TableHead>{t('common.type')}</TableHead>
                <TableHead className="w-[100px] text-right">
                  <span className="sr-only">{t('common.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.name}>
                  <TableCell className="font-medium">{category.name}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

