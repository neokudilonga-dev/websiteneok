
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
import { PlusCircle } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
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
                        alt={`${product.name} image ${index + 1}`}
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
              alt={product.name}
              className="h-full w-full object-cover"
              height="400"
              src={displayImage}
              width="600"
              data-ai-hint={product.dataAiHint}
            />
          </div>
        )}
        <div className="absolute top-2 flex w-full justify-end gap-2 pr-2">
            {isOutOfStock && <Badge variant="secondary" className="bg-yellow-500/80 text-black">Atraso na Entrega</Badge>}
            <Badge
                className="capitalize"
                variant={product.type === "book" ? "secondary" : "default"}
                >
                {product.type === 'book' ? 'Livro' : 'Jogo'}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="font-headline text-lg">{product.name}</CardTitle>
        <CardDescription className="mt-1 line-clamp-2 text-sm">
          {product.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <p className="text-base font-semibold">
          {product.price.toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })}
        </p>
        <Button onClick={() => addToCart(product)} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
}
