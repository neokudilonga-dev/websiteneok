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
import { Separator } from "@/components/ui/separator";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import CartItem from "./cart-item";

export default function Cart() {
  const { cartItems, cartCount, cartTotal } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0">
              {cartCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle className="font-headline">Shopping Cart ({cartCount})</SheetTitle>
        </SheetHeader>
        {cartCount > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <div className="flex flex-col gap-4">
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>
            <SheetFooter className="mt-auto flex flex-col gap-4 bg-background p-6">
              <Separator />
              <div className="flex items-center justify-between text-lg font-semibold">
                <p>Total</p>
                <p>${cartTotal.toFixed(2)}</p>
              </div>
              <SheetClose asChild>
                <Button size="lg" className="w-full">
                  Proceed to Checkout
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/50" />
            <p className="text-xl font-semibold text-muted-foreground">
              Your cart is empty
            </p>
            <SheetClose asChild>
              <Button variant="link">Start Shopping</Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
