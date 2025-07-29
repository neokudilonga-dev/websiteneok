
"use client";

import Header from "@/components/header";
import CheckoutForm from "@/components/checkout-form";
import { useCart } from "@/context/cart-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useLanguage } from "@/context/language-context";
import { useData } from "@/context/data-context";
import { useEffect } from "react";

export default function CheckoutPage() {
  const { cartItems, cartTotal } = useCart();
  const { t, language } = useLanguage();
  const { loading, setLoading, refetchData } = useData();

  useEffect(() => {
    const loadPageData = async () => {
        setLoading(true);
        await refetchData();
        setLoading(false);
    }
    loadPageData();
  }, [refetchData, setLoading]);


  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
            <p>Loading checkout...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
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

            <div className="lg:col-span-1">
              <Card className="sticky top-28">
                <CardHeader>
                  <CardTitle>{t('checkout_page.order_summary')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item, index) => (
                      <div key={`${item.id}-${item.kitId || ''}-${index}`} className="flex items-center gap-4">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                          <Image
                            src={
                              item.type === "book"
                                ? item.image || "https://placehold.co/64x64.png"
                                : item.images?.[0] || "https://placehold.co/64x64.png"
                            }
                            alt={item.name[language] || item.name.pt}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{item.name[language] || item.name.pt}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x{" "}
                            {item.price.toLocaleString("pt-PT", {
                              style: "currency",
                              currency: "AOA",
                              minimumFractionDigits: 0, 
                              maximumFractionDigits: 0
                            })}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {(item.price * item.quantity).toLocaleString(
                            "pt-PT",
                            { style: "currency", currency: "AOA", minimumFractionDigits: 0, maximumFractionDigits: 0 }
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-6" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p>{t('checkout_page.subtotal')}</p>
                      <p>
                        {cartTotal.toLocaleString("pt-PT", {
                          style: "currency",
                          currency: "AOA",
                          minimumFractionDigits: 0, 
                          maximumFractionDigits: 0
                        })}
                      </p>
                    </div>
                    {/* Delivery fee will be added here via state */}
                    <div className="flex justify-between text-lg font-bold">
                      <p>{t('common.total')}</p>
                      <p>
                        {cartTotal.toLocaleString("pt-PT", {
                          style: "currency",
                          currency: "AOA",
                          minimumFractionDigits: 0, 
                          maximumFractionDigits: 0
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
