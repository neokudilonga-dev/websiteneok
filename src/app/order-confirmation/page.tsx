
"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderRef = searchParams.get("ref");

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-muted/20">
        <div className="mx-auto max-w-2xl py-12 px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardHeader className="items-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <CardTitle className="text-3xl font-bold">Encomenda Recebida!</CardTitle>
                <CardDescription className="text-lg">
                    Obrigado pela sua compra.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                    A sua encomenda com a referência <span className="font-bold text-primary">{orderRef}</span> foi registada com sucesso.
                </p>
                <p className="text-muted-foreground">
                    Receberá um e-mail automático a confirmar o que encomendou. Posteriormente, será contactado/a via WhatsApp para os próximos passos.
                </p>
                <Button asChild size="lg">
                    <Link href="/">Voltar à Loja</Link>
                </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
