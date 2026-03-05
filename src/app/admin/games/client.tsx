
"use client";

import { useState, useMemo, useEffect } from "react";
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
import type { Product, School, ReadingPlanItem } from "@/lib/types";
import { AddEditGameSheet } from "@/components/admin/add-edit-game-sheet";
import { GameImportSheet } from "@/components/admin/game-import-sheet";
import { Input } from "@/components/ui/input";
import { useData } from "@/context/data-context";
import { useLanguage } from "@/context/language-context";
import { DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { getDisplayName, normalizeSearch } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GamesPageClientProps {
    initialProducts: Product[];
    initialSchools: School[];
    initialReadingPlan: ReadingPlanItem[];
}

export default function GamesPageClient({ initialProducts, initialSchools, initialReadingPlan }: GamesPageClientProps) {
  const { products, setProducts, deleteProduct, schools, setSchools, readingPlan, setReadingPlan } = useData();
  const { t, language } = useLanguage();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    setProducts(initialProducts);
    setSchools(initialSchools);
    setReadingPlan(initialReadingPlan);
  }, [initialProducts, initialSchools, initialReadingPlan, setProducts, setSchools, setReadingPlan]);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch('/api/auth/verify', { credentials: 'include' });
        const data = await res.json();
        setIsOwner(!!data?.isAuthenticated && data?.role === 'owner');
      } catch {
        setIsOwner(false);
      }
    };
    checkRole();
  }, []);

  const [isSheetOpen, setSheetOpen] = useState(false);
  const [isImportSheetOpen, setImportSheetOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Product | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSoldOut, setShowSoldOut] = useState(false);
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Product | null>(null);

  const gameProducts = useMemo(() => products.filter(p => p.type === 'game'), [products]);

  const handleAddGame = () => {
    setSelectedGame(undefined);
    setSheetOpen(true);
  };

  const handleEditGame = (game: Product) => {
    setSelectedGame(game);
    setSheetOpen(true);
  };

  const handleDeleteGame = (game: Product) => {
    if (!isOwner) return;
    const images = Array.isArray(game.image) ? game.image : (game.image ? [game.image] : []);
    if (images.length > 0) {
      setGameToDelete(game);
      setDeleteConfirmOpen(true);
    } else {
      deleteProduct(game.id);
    }
  };

  const confirmDelete = () => {
    if (gameToDelete) {
      const imageUrl = Array.isArray(gameToDelete.image) ? gameToDelete.image[0] : gameToDelete.image;
      deleteProduct(gameToDelete.id, imageUrl);
      setGameToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const getStatusLabel = (status: Product['stockStatus']) => {
    if (status === 'sold_out') return t('stock_status.sold_out');
    if (status === 'in_stock') return t('stock_status.in_stock');
    if (status === 'out_of_stock') return t('stock_status.out_of_stock');
    return '';
  }

  const filteredProducts = useMemo(() => {
    let result = gameProducts;

    if (searchQuery) {
      const normalizedQuery = normalizeSearch(searchQuery);
      result = result.filter(product => {
        const name = getDisplayName(product.name, language);
        return normalizeSearch(name).includes(normalizedQuery);
      });
    }

    if (!showSoldOut) {
      result = result.filter(product => product.stockStatus !== 'sold_out');
    }

    if (schoolFilter !== "all") {
      result = result.filter(product => {
        const rp = readingPlan.filter(item => item.productId === product.id);
        return rp.some(item => item.schoolId === schoolFilter);
      });
    }

    return result;
  }, [gameProducts, searchQuery, language, showSoldOut, schoolFilter, readingPlan]);

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
                <DropdownMenuRadioGroup value={schoolFilter} onValueChange={setSchoolFilter}>
                  <DropdownMenuLabel>{t('games_page.filter_by_school')}</DropdownMenuLabel>
                  <DropdownMenuRadioItem value="all">
                    {t('common.all_schools')}
                  </DropdownMenuRadioItem>
                  {(schools || []).map((school) => (
                    <DropdownMenuRadioItem key={school?.id} value={school?.id}>
                      {school && typeof school.name === 'object' && school.name !== null
                        ? ((school.name as Record<string, string>)[language] ?? (school.name as Record<string, string>).pt ?? "")
                        : (school && typeof school.name === 'string' ? school.name : "")}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleAddGame} className="shrink-0">
              <PlusCircle className="mr-2" />
              {t('games_page.add_new_game')}
            </Button>
            <Button onClick={() => setImportSheetOpen(true)} className="shrink-0">
              Importar/Exportar Jogos
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
                      alt={product ? getDisplayName(product.name, language) : "Product"}
                      className="aspect-[3/4] rounded-md object-contain bg-muted/30"
                      height="64"
                      src={product && Array.isArray(product.image) && product.image.length > 0 ? product.image[0] : (product && typeof product.image === 'string' ? product.image : "https://placehold.co/64x64.png")}
                      width="48"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{getDisplayName(product.name, language)}</TableCell>
                  <TableCell>
                      <Badge 
                        variant={product.stockStatus === 'sold_out' ? 'destructive' : product.stockStatus === 'out_of_stock' ? 'secondary' : 'default'}
                      >
                         {getStatusLabel(product.stockStatus)}
                      </Badge>
                   </TableCell>
                   <TableCell>
                    {product.stock ?? 0}
                   </TableCell>
                  <TableCell>
                    {(product.price || 0).toLocaleString("pt-PT", {
                      style: "currency",
                      currency: "AOA",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                     <Badge variant="outline">{Array.isArray(product.image) ? product.image.length : (product.image ? 1 : 0)}</Badge>
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
                        {isOwner && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteGame(product)}
                          >
                            {t('common.delete')}
                          </DropdownMenuItem>
                        )}
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
      <GameImportSheet
        isOpen={isImportSheetOpen}
        setIsOpen={setImportSheetOpen}
      />
      {isOwner && (
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('games_page.delete_warning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      )}
    </>
  );
}
