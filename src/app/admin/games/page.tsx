
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Search, Filter } from "lucide-react";
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
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { AddEditGameSheet } from "@/components/admin/add-edit-game-sheet";
import { Input } from "@/components/ui/input";
import { useData } from "@/context/data-context";

export default function GamesPage() {
  const { products, addProduct, updateProduct, deleteProduct, updateReadingPlanForProduct } = useData();

  const [isSheetOpen, setSheetOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Product | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSoldOut, setShowSoldOut] = useState(false);

  const gameProducts = useMemo(() => products.filter(p => p.type === 'game'), [products]);

  const filteredProducts = useMemo(() => {
    return gameProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStock = showSoldOut || product.stockStatus !== 'sold_out';
      return matchesSearch && matchesStock;
    });
  }, [gameProducts, searchQuery, showSoldOut]);

  const handleAddGame = () => {
    setSelectedGame(undefined);
    setSheetOpen(true);
  };

  const handleEditGame = (game: Product) => {
    setSelectedGame(game);
    setSheetOpen(true);
  };

  const handleDeleteGame = (gameId: string) => {
    deleteProduct(gameId);
  };

  const handleSaveChanges = (gameData: Product, newReadingPlan: {schoolId: string, grade: number | string, status: 'mandatory' | 'recommended'}[]) => {
    let game = gameData;
    if (selectedGame) {
      updateProduct(game);
    } else {
      game = addProduct(game);
    }
    updateReadingPlanForProduct(game.id, newReadingPlan);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Jogos e Outros</CardTitle>
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
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="shrink-0">
                  <Filter className="mr-2" />
                  Filtrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={showSoldOut}
                  onCheckedChange={setShowSoldOut}
                >
                  Mostrar Esgotados
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                <TableHead>Estado</TableHead>
                <TableHead>Stock</TableHead>
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
                      <Badge 
                        variant={product.stockStatus === 'sold_out' ? 'destructive' : product.stockStatus === 'out_of_stock' ? 'secondary' : 'default'}
                      >
                         {product.stockStatus === 'sold_out' && 'Esgotado'}
                         {product.stockStatus === 'in_stock' && 'Em Stock'}
                         {product.stockStatus === 'out_of_stock' && 'Atraso na Entrega'}
                      </Badge>
                   </TableCell>
                   <TableCell>
                    {product.stock}
                   </TableCell>
                  <TableCell>
                    {product.price.toLocaleString("pt-PT", {
                      style: "currency",
                      currency: "AOA",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
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
