
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Gamepad2, ShoppingBag } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[400px] w-full bg-primary/10">
          <div className="absolute inset-0 z-0">
             <Image
                src="https://placehold.co/1920x1080.png"
                alt="Children reading books"
                fill
                className="object-cover"
                priority
                data-ai-hint="happy children reading"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>
          <div className="container relative z-10 flex h-full flex-col items-center justify-center text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Tudo o que precisa para o regresso às aulas
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-foreground/80">
              Encontre os planos de leitura escolar, livros, e jogos didáticos. A sua jornada de conhecimento começa aqui.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/loja">
                Ir para a Loja <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 lg:py-24">
          <div className="container">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card className="transform transition-transform hover:scale-105 hover:shadow-xl">
                <CardHeader className="items-center text-center">
                    <div className="rounded-full bg-primary/10 p-4 text-primary">
                        <BookOpen className="h-8 w-8" />
                    </div>
                  <CardTitle className="font-headline text-xl">Planos de Leitura</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Acesse as listas de livros obrigatórios e recomendados para cada escola e ano de escolaridade.
                  </p>
                   <Button asChild variant="outline" className="mt-4">
                        <Link href="/loja">Ver Planos</Link>
                    </Button>
                </CardContent>
              </Card>
              <Card className="transform transition-transform hover:scale-105 hover:shadow-xl">
                <CardHeader className="items-center text-center">
                     <div className="rounded-full bg-primary/10 p-4 text-primary">
                        <ShoppingBag className="h-8 w-8" />
                    </div>
                  <CardTitle className="font-headline text-xl">Catálogo de Livros</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Explore o nosso vasto catálogo de livros, para todas as idades e interesses.
                  </p>
                   <Button asChild variant="outline" className="mt-4">
                        <Link href="/loja#catalogo">Explorar Catálogo</Link>
                    </Button>
                </CardContent>
              </Card>
              <Card className="transform transition-transform hover:scale-105 hover:shadow-xl">
                <CardHeader className="items-center text-center">
                     <div className="rounded-full bg-primary/10 p-4 text-primary">
                        <Gamepad2 className="h-8 w-8" />
                    </div>
                  <CardTitle className="font-headline text-xl">Jogos e Outros</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Descubra jogos educativos, instrumentos musicais e outros materiais didáticos.
                  </p>
                   <Button asChild variant="outline" className="mt-4">
                        <Link href="/loja#jogos">Ver Jogos</Link>
                    </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
         {/* How it works Section */}
        <section className="bg-muted/40 py-12 sm:py-16 lg:py-24">
            <div className="container text-center">
                <h2 className="font-headline text-3xl font-bold">Como Funciona</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Comprar na BiblioAngola é fácil e rápido. Siga estes passos simples.
                </p>
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <span className="font-bold text-2xl">1</span>
                        </div>
                        <h3 className="font-headline text-xl font-semibold">Escolha a Escola</h3>
                        <p className="text-muted-foreground">Selecione a escola e a classe do seu educando para ver o plano de leitura específico.</p>
                    </div>
                     <div className="flex flex-col items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                             <span className="font-bold text-2xl">2</span>
                        </div>
                        <h3 className="font-headline text-xl font-semibold">Adicione ao Carrinho</h3>
                        <p className="text-muted-foreground">Adicione os kits completos ou os livros individuais que precisa ao seu carrinho de compras.</p>
                    </div>
                     <div className="flex flex-col items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <span className="font-bold text-2xl">3</span>
                        </div>
                        <h3 className="font-headline text-xl font-semibold">Finalize a Compra</h3>
                        <p className="text-muted-foreground">Preencha os seus dados, escolha a forma de entrega e pagamento, e finalize a sua encomenda.</p>
                    </div>
                </div>
            </div>
        </section>

      </main>
      <footer className="border-t">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Neokudilonga. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
