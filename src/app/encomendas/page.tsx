
"use client";

import { useState } from "react";
import Header from "@/components/header";
import { useLanguage } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Package, CreditCard, Calendar } from "lucide-react";

export default function TrackOrderPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/search?email=${encodeURIComponent(email)}&reference=${encodeURIComponent(reference)}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(t('track_order_page.not_found'));
        }
        throw new Error("Error searching order");
      }
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, type: 'payment' | 'delivery') => {
    const variants: any = {
      paid: "default",
      unpaid: "destructive",
      partially_paid: "secondary",
      delivered: "default",
      not_delivered: "outline",
      school_pickup: "secondary",
      out_of_stock: "destructive",
      cancelled: "destructive",
      cod: "secondary"
    };
    
    // Translation key mapping
    const labelKey = type === 'payment' ? `payment_method_${status}` : status;
    
    return (
      <Badge variant={variants[status] || "outline"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-muted/20 py-12">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                {t('track_order_page.title')}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {t('track_order_page.description')}
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSearch} className="grid gap-4 sm:grid-cols-2 sm:items-end">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('track_order_page.email_label')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('track_order_page.email_placeholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference">{t('track_order_page.reference_label')}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="reference"
                        placeholder={t('track_order_page.reference_placeholder')}
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        required
                      />
                      <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </form>
                {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
              </CardContent>
            </Card>

            {order && (
              <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader>
                  <CardTitle>{t('track_order_page.order_details')}</CardTitle>
                  <CardDescription>{order.reference} - {new Date(order.createdAt || order.date).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <CreditCard className="mt-1 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('track_order_page.status_payment')}</p>
                        <div className="mt-1">{getStatusBadge(order.paymentStatus, 'payment')}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Package className="mt-1 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('track_order_page.status_delivery')}</p>
                        <div className="mt-1">{getStatusBadge(order.deliveryStatus, 'delivery')}</div>
                      </div>
                    </div>
                    {order.deliveryDate && (
                      <div className="flex items-start gap-3 sm:col-span-2">
                        <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{t('track_order_page.delivery_date')}</p>
                          <p className="mt-1 font-semibold">{new Date(order.deliveryDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">{t('track_order_page.items')}</h3>
                    <div className="divide-y rounded-lg border">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between p-3 text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-medium">
                            {(item.price * item.quantity).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between p-3 font-bold bg-muted/30">
                        <span>Total</span>
                        <span>{order.total.toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
