
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Header from "@/components/header";

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 bg-muted/20">
            <div className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                        Finalizar Compra
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Complete a sua encomenda.
                    </p>
                </div>

                <Card className="mt-12">
                     <CardHeader>
                        <CardTitle>Resumo da Encomenda</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p>Em breve poderá finalizar a sua compra aqui.</p>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
