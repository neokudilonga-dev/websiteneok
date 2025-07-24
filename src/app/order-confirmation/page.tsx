
"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Link from "next/link";
import { CheckCircle, AlertTriangle } from "lucide-react";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderRef = searchParams.get("ref");
  const paymentMethod = searchParams.get("payment");

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
                
                {paymentMethod === 'transferencia' ? (
                     <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-left text-yellow-800">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium">Ação Necessária: Pagamento Pendente</h3>
                                <div className="mt-2 text-sm">
                                    <p>Para confirmar a sua encomenda, por favor realize o pagamento por transferência bancária para o IBAN abaixo e envie o comprovativo para um dos nossos contactos.</p>
                                    <ul className="mt-2 list-inside list-disc space-y-1">
                                        <li><strong>IBAN:</strong> BIC AO06 0051 0000 8030 4996 1512 5</li>
                                        <li><strong>Email:</strong> neokudilonga@gmail.com</li>
                                        <li><strong>WhatsApp:</strong> +244 919 948 887</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground">
                        Receberá um e-mail automático a confirmar o que encomendou. Posteriormente, será contactado/a via WhatsApp para os próximos passos.
                    </p>
                )}

                <Button asChild size="lg">
                    <Link href="/loja">Voltar à Loja</Link>
                </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
