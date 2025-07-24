
"use client";

import { useState } from "react";
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


export default function CategoriesPage() {
  const { categories, addCategory, deleteCategory } = useData();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'book' | 'game'>('book');

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
            <CardTitle>Categorias</CardTitle>
            <CardDescription>Faça a gestão das categorias para os livros e jogos.</CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Adicionar Categoria
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Adicionar Nova Categoria</AlertDialogTitle>
                <AlertDialogDescription>
                    Digite o nome e selecione o tipo da nova categoria.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="category-name">Nome da Categoria</Label>
                        <Input 
                            id="category-name"
                            value={newCategoryName} 
                            onChange={(e) => setNewCategoryName(e.target.value)} 
                            placeholder="Ex: Biologia"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label>Tipo de Categoria</Label>
                        <RadioGroup defaultValue="book" onValueChange={(value) => setNewCategoryType(value as 'book' | 'game')} value={newCategoryType}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="book" id="r-book" />
                                <Label htmlFor="r-book">Livro</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="game" id="r-game" />
                                <Label htmlFor="r-game">Jogo e Outros</Label>
                            </div>
                        </RadioGroup>
                     </div>
                </div>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleAddCategory}>Adicionar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="w-[100px] text-right">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.name}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                   <TableCell>
                     <Badge variant={category.type === 'book' ? 'secondary' : 'default'}>
                        {category.type === 'book' ? 'Livro' : 'Jogo'}
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
                                <span className="sr-only">Eliminar Categoria</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isto irá eliminar permanentemente a categoria.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCategory(category.name)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
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
