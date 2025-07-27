
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
import { useLanguage } from "@/context/language-context";

export default function GamesPage() {
  const { products, deleteProduct } = useData();
  const { t, language } = useLanguage();

  const [isSheetOpen, setSheetOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Product | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSoldOut, setShowSoldOut] = useState(false);

  const gameProducts = useMemo(() => products.filter(p => p.type === 'game'), [products]);
  
  const getProductName = (product: Product) => {
    if (!product || !product.name) return 'No Name';
    return product.name[language] || product.name.pt || 'Unnamed Product';
  }

  const filteredProducts = useMemo(() => {
    return gameProducts.filter((product) => {
      const name = getProductName(product) || '';
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStock = showSoldOut || product.stockStatus !== 'sold_out';
      return matchesSearch && matchesStock;
    });
  }, [gameProducts, searchQuery, showSoldOut, language]);

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

  const getStatusLabel = (status: Product['stockStatus']) => {
    if (status === 'sold_out') return t('stock_status.sold_out');
    if (status === 'in_stock') return t('stock_status.in_stock');
    if (status === 'out_of_stock') return t('stock_status.out_of_stock');
    return '';
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{t('games_page.title')}</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('games_page.search_placeholder')}
                className="w-full rounded-lg bg-background pl-8 sm:w-[200px] lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="shrink-0">
                  <Filter className="mr-2" />
                  {t('common.filter')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('common.filter_by')}</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={showSoldOut}
                  onCheckedChange={setShowSoldOut}
                >
                  {t('games_page.show_sold_out')}
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleAddGame} className="shrink-0">
              <PlusCircle className="mr-2" />
              {t('games_page.add_new_game')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">{t('common.image')}</span>
                </TableHead>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('common.stock')}</TableHead>
                <TableHead>{t('common.price')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('games_page.image_count')}</TableHead>
                <TableHead>
                  <span className="sr-only">{t('common.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={getProductName(product)}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.images?.[0] || "https://placehold.co/64x64.png"}
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{getProductName(product)}</TableCell>
                  <TableCell>
                      <Badge 
                        variant={product.stockStatus === 'sold_out' ? 'destructive' : product.stockStatus === 'out_of_stock' ? 'secondary' : 'default'}
                      >
                         {getStatusLabel(product.stockStatus)}
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
                          <span className="sr-only">{t('common.toggle_menu')}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEditGame(product)}
                        >
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteGame(product.id)}
                        >
                          {t('common.delete')}
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
      />
    </>
  );
}
