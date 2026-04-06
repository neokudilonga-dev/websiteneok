
"use client";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { useCart } from "@/context/cart-context";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useLanguage } from "@/context/language-context";
import { normalizeImageUrl, getDisplayName } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  productBadgeRenderer?: (product: Product) => React.ReactNode;
}

export default function ProductCard({ product, productBadgeRenderer }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const [imageError, setImageError] = useState(false);
  const [carouselErrors, setCarouselErrors] = useState<Record<number, boolean>>({});
  
  const displayName = getDisplayName(product.name, language);

  const displayDescription = typeof product.description === 'string'
    ? product.description
    : (typeof product.description === 'object' && product.description !== null ? (product.description?.[language] || product.description?.pt || '') : '');

  const displayImage = Array.isArray(product.image)
    ? normalizeImageUrl(product.image[0])
    : normalizeImageUrl(product.image);
  const isOutOfStock = product.stockStatus === 'out_of_stock';

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="relative p-0 cursor-pointer">
        <Link href={`/produto/${product.id}`} className="block">
        {Array.isArray(product.image) && product.image.length > 1 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {product.image.map((img: string, index: number) => (
                 <CarouselItem key={index}>
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/30">
                      <Image
                        alt={`${displayName || 'Product'} image ${index + 1}`}
                        src={carouselErrors[index] ? "https://placehold.co/600x400.png" : normalizeImageUrl(img)}
                        fill
                        className="h-full w-full object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={() => setCarouselErrors(prev => ({ ...prev, [index]: true }))}
                        data-ai-hint={product.dataAiHint}
                      />
                    </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100" />
          </Carousel>
        ) : (
           <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/30">
            <Image
              alt={`${displayName || 'Product'} image ${0 + 1}`}
              className="object-contain w-full h-full"
              src={imageError ? "https://placehold.co/600x400.png" : displayImage}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={product.dataAiHint}
              onError={() => setImageError(true)}
            />
          </div>
        )}
        </Link>
        <div className="absolute top-2 flex w-full justify-end gap-2 pr-2">
            {productBadgeRenderer ? productBadgeRenderer(product) : null}
            {isOutOfStock && <Badge variant="secondary" className="bg-yellow-500/80 text-black">{t('stock_status.out_of_stock')}</Badge>}
            <Badge
                className={product.type === "book" ? "capitalize" : "capitalize bg-teal-600 hover:bg-teal-700"}
                variant={product.type === "book" ? "secondary" : "default"}
                >
                {product.type === 'book' ? t('common.book') : t('common.game_and_other')}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 cursor-pointer">
        <Link href={`/produto/${product.id}`} className="block hover:text-primary transition-colors">
          <CardTitle className="font-headline text-lg">{displayName}</CardTitle>
        </Link>
        <CardDescription className="mt-1 line-clamp-2 text-sm">
          {displayDescription}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <p className="text-sm font-semibold">
          {(product.price || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
        <Button onClick={() => addToCart(product)} size="sm">
          {t('common.add_to_cart')}
        </Button>
      </CardFooter>
    </Card>
  );
}
