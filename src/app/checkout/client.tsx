
"use client";

import { useCart } from "@/context/cart-context";
import { useLanguage } from "@/context/language-context";
import CheckoutForm from "@/components/checkout-form";

export default function CheckoutClient() {
  const { cartItems, cartTotal } = useCart();
  const { t } = useLanguage();

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

        <div className="mt-12 flex justify-center">
          <div className="w-full max-w-2xl">
            <CheckoutForm />
          </div>
        </div>
      </div>
    </main>
  );
}
