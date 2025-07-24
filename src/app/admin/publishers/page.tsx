
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
import { useData } from "@/context/data-context";


export default function PublishersPage() {
  const { publishers, addPublisher, deletePublisher } = useData();
  const [newPublisher, setNewPublisher] = useState('');

  const handleAddPublisher = () => {
    if (newPublisher && !publishers.includes(newPublisher)) {
        addPublisher(newPublisher);
        setNewPublisher('');
    }
  };

  const handleDeletePublisher = (publisherToDelete: string) => {
    deletePublisher(publisherToDelete);
  };


  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Editoras de Livros</CardTitle>
            <CardDescription>Faça a gestão das editoras para os livros.</CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Adicionar Editora
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Adicionar Nova Editora</AlertDialogTitle>
                <AlertDialogDescription>
                    Digite o nome da nova editora de livro.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <Input 
                    value={newPublisher} 
                    onChange={(e) => setNewPublisher(e.target.value)} 
                    placeholder="Ex: Editora Angola"
                />
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleAddPublisher}>Adicionar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Editora</TableHead>
                <TableHead className="w-[100px] text-right">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publishers.map((publisher) => (
                <TableRow key={publisher}>
                  <TableCell className="font-medium">{publisher}</TableCell>
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
                                <span className="sr-only">Eliminar Editora</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isto irá eliminar permanentemente a editora.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePublisher(publisher)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
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
