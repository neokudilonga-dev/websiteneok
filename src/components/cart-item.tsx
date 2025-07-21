"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/cart-context";
import type { CartItem as CartItemType } from "@/lib/types";
import { Minus, Plus, X } from "lucide-react";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (change: number) => {
    updateQuantity(item.id, item.quantity + change);
  };
  
  const displayImage = item.type === 'book' ? item.image : (item.images?.[0] || 'https://placehold.co/600x400.png');


  return (
    <div className="flex items-start gap-4">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
        <Image
          src={displayImage}
          alt={item.name}
          fill
          className="object-cover"
          data-ai-hint={item.dataAiHint}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex justify-between">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="font-semibold">{(item.price * item.quantity).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })}</p>
        </div>
        <p className="text-sm text-muted-foreground">{item.price.toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })} cada</p>
        <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(-1)}>
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                 <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(1)}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                <X className="h-4 w-4" />
            </Button>
        </div>
      </div>
    </div>
  );
}
