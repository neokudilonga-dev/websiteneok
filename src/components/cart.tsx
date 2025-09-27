
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import CartItem from "./cart-item";
import type { CartItem as CartItemType } from "@/lib/types";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";

export default function Cart() {
  const { cartItems, cartCount, cartTotal } = useCart();
  const { t } = useLanguage();

  const individualItems = cartItems.filter(item => !item.kitId);
  const kitItems: Record<string, CartItemType[]> = cartItems.reduce((acc, item) => {
    if (item.kitId) {
      if (!acc[item.kitId]) {
        acc[item.kitId] = [];
      }
      acc[item.kitId].push(item);
    }
    return acc;
  }, {} as Record<string, CartItemType[]>);


  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="default" size="lg" className="relative shrink-0">
          <ShoppingCart className="mr-2 h-5 w-5" />
          <span className="hidden sm:inline">{t('header.cart')}</span>
          {cartCount > 0 && (
            <Badge className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full p-0">
              {cartCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle className="font-headline">{t('cart.title')} ({cartCount})</SheetTitle>
        </SheetHeader>
        {cartCount > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <div className="flex flex-col gap-4">
                 {Object.entries(kitItems).map(([kitId, items]) => (
                    <div key={kitId} className="space-y-4 rounded-lg border bg-muted/30 p-4">
                      <h4 className="font-semibold text-center">{items[0].kitName}</h4>
                      <div className="flex flex-col gap-4">
                        {items.map((item) => (
                          <CartItem key={`${item.id}-${kitId}`} item={item} isKitItem={true} />
                        ))}
                      </div>
                    </div>
                ))}
                {individualItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>
            <SheetFooter className="mt-auto flex flex-col gap-4 bg-background p-6">

              <div className="flex items-center justify-between text-lg font-semibold">
                <span>{t('common.total')} ..</span>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <span>{cartTotal.toLocaleString('pt-PT', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </div>
              <SheetClose asChild>
                 <Link href="/checkout" className="w-full">
                    <Button size="lg" className="w-full">
                        {t('cart.checkout')}
                    </Button>
                </Link>
              </SheetClose>
            </SheetFooter>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/50" />
            <p className="text-xl font-semibold text-muted-foreground">
              {t('cart.empty_cart_message')}
            </p>
            <SheetClose asChild>
              <Button variant="link">{t('cart.start_shopping')}</Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
