
"use client";

import Image from "next/image";
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

interface ProductCardProps {
  product: Product;
  renderBadge?: (product: Product) => React.ReactNode;
}

export default function ProductCard({ product, renderBadge }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  
  const displayName = product.name[language] || product.name.pt;
  const displayDescription = product.description[language] || product.description.pt;
  const displayImage = product.type === 'book' ? product.image : (product.images?.[0] || 'https://placehold.co/600x400.png');
  const isOutOfStock = product.stockStatus === 'out_of_stock';

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="relative p-0">
        {product.type === 'game' && product.images && product.images.length > 1 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {product.images.map((img, index) => (
                 <CarouselItem key={index}>
                    <div className="aspect-video overflow-hidden">
                      <Image
                        alt={`${displayName} image ${index + 1}`}
                        className="h-full w-full object-cover"
                        height="400"
                        src={img}
                        width="600"
                        data-ai-hint={product.dataAiHint}
                      />
                    </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {product.images.length > 1 && (
                <>
                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                </>
            )}
          </Carousel>
        ) : (
           <div className="aspect-video overflow-hidden">
            <Image
              alt={displayName}
              className="h-full w-full object-cover"
              height="400"
              src={displayImage}
              width="600"
              data-ai-hint={product.dataAiHint}
            />
          </div>
        )}
        <div className="absolute top-2 flex w-full justify-end gap-2 pr-2">
            {renderBadge ? renderBadge(product) : null}
            {isOutOfStock && <Badge variant="secondary" className="bg-yellow-500/80 text-black">{t('stock_status.out_of_stock')}</Badge>}
            <Badge
                className="capitalize"
                variant={product.type === "book" ? "secondary" : "default"}
                >
                {product.type === 'book' ? t('common.book') : t('common.game')}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="font-headline text-lg">{displayName}</CardTitle>
        <CardDescription className="mt-1 line-clamp-2 text-sm">
          {displayDescription}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <p className="text-sm font-semibold">
          {product.price.toLocaleString('pt-PT', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
        <Button onClick={() => addToCart(product)} size="sm">
          {t('common.add_to_cart')}
        </Button>
      </CardFooter>
    </Card>
  );
}
