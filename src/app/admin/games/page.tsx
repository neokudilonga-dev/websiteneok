
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Search } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { products as initialProducts } from "@/lib/data";
import type { Product } from "@/lib/types";
import { AddEditGameSheet } from "@/components/admin/add-edit-game-sheet";
import { Input } from "@/components/ui/input";

export default function GamesPage() {
  const [products, setProducts] = useState<Product[]>(
    initialProducts.filter((p) => p.type === "game")
  );
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Product | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleAddGame = () => {
    setSelectedGame(undefined);
    setSheetOpen(true);
  };

  const handleEditGame = (game: Product) => {
    setSelectedGame(game);
    setSheetOpen(true);
  };

  const handleDeleteGame = (gameId: string) => {
    setProducts(products.filter((p) => p.id !== gameId));
  };

  const handleSaveChanges = (game: Product) => {
    if (selectedGame) {
      setProducts(products.map((p) => (p.id === game.id ? game : p)));
    } else {
      const newGame = { ...game, id: `game-${Date.now()}` };
      setProducts([...products, newGame]);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Jogos</CardTitle>
            <CardDescription>
              Faça a gestão do catálogo de jogos da sua loja.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar jogos..."
                className="w-full rounded-lg bg-background pl-8 sm:w-[200px] lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleAddGame} className="shrink-0">
              <PlusCircle className="mr-2" />
              Adicionar Novo Jogo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Imagem</span>
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="hidden md:table-cell">Nº Imagens</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={product.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.images?.[0] || "https://placehold.co/64x64.png"}
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {product.price.toLocaleString("pt-PT", {
                      style: "currency",
                      currency: "AOA",
                    })}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                     <Badge variant="outline">{product.images?.length || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Alternar menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEditGame(product)}
                        >
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteGame(product.id)}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddEditGameSheet
        isOpen={isSheetOpen}
        setIsOpen={setSheetOpen}
        game={selectedGame}
        onSaveChanges={handleSaveChanges}
      />
    </>
  );
}
