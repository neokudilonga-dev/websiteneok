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

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="relative p-0">
        <div className="aspect-video overflow-hidden">
          <Image
            alt={product.name}
            className="h-full w-full object-cover"
            height="400"
            src={product.image}
            width="600"
            data-ai-hint={product.dataAiHint}
          />
        </div>
        <Badge
          className="absolute right-2 top-2 capitalize"
          variant={product.type === "book" ? "secondary" : "default"}
        >
          {product.type}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="font-headline text-lg">{product.name}</CardTitle>
        <CardDescription className="mt-1 line-clamp-2 text-sm">
          {product.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <p className="text-lg font-semibold">
          ${product.price.toFixed(2)}
        </p>
        <Button onClick={() => addToCart(product)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
