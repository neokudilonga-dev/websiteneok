
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import type { CartItem as CartItemType } from "@/lib/types";
import { Minus, Plus, X } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { getDisplayName } from "@/lib/utils";
import { normalizeImageUrl } from "@/lib/utils";

interface CartItemProps {
  item: CartItemType;
  isKitItem?: boolean;
}

export default function CartItem({ item, isKitItem = false }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const { t, language } = useLanguage();

  const handleQuantityChange = (change: number) => {
    // For kit items, we don't allow quantity change from the cart view
    if (isKitItem) return;
    updateQuantity(item.id, item.quantity + change);
  };
  
  const rawImage = typeof item.image === 'string' ? item.image : (Array.isArray(item.image) && item.image.length > 0 ? item.image[0] : undefined);
  const displayImage = normalizeImageUrl(rawImage);

  return (
    <div className="flex items-start gap-4">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
        <Image
          src={displayImage}
          alt={getDisplayName(item.name, language)}
          fill
          className="object-cover"
          data-ai-hint={item.dataAiHint}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex justify-between">
          <h3 className="font-semibold">{getDisplayName(item.name, language)}</h3>
          <p className="font-semibold">{(item.price * item.quantity).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </div>
        <p className="text-sm text-muted-foreground">{item.price.toLocaleString('pt-PT', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0, maximumFractionDigits: 0 })} {t('cart.each')}</p>
        <div className="mt-2 flex items-center justify-between">
            {isKitItem ? (
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t('cart.quantity')}: {item.quantity}</span>
                 </div>
            ) : (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(-1)}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(1)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            )}
             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                <X className="h-4 w-4" />
            </Button>
        </div>
      </div>
    </div>
  );
}
