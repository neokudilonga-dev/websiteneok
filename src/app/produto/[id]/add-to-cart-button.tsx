"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";

interface AddToCartButtonProps {
  product: Product;
  isOutOfStock: boolean;
}

export default function AddToCartButton({ product, isOutOfStock }: AddToCartButtonProps) {
  const { addToCart } = useCart();

  if (isOutOfStock) {
    return (
      <Button disabled className="w-full" size="lg">
        Esgotado
      </Button>
    );
  }

  return (
    <Button 
      onClick={() => addToCart(product)} 
      className="w-full gap-2" 
      size="lg"
    >
      <ShoppingCart className="h-5 w-5" />
      Adicionar ao Carrinho
    </Button>
  );
}
