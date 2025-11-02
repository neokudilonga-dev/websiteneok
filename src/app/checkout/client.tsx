
"use client";

import { useCart } from "@/context/cart-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useLanguage } from "@/context/language-context";
import { getDisplayName } from "@/lib/utils";
import CheckoutForm from "@/components/checkout-form";

export default function CheckoutClient() {
  const { cartItems, cartTotal } = useCart();
  const { t, language } = useLanguage();

  return (
    <main className="flex-1 bg-muted/20">
      <div className="container mx-auto max-w-6xl py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            {t('checkout_page.title')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('checkout_page.description')}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="lg:col-span-1">
            <CheckoutForm />
          </div>


        </div>
      </div>
    </main>
  );
}
