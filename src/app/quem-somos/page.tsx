
import Image from "next/image";
import Header from "@/components/header";
import { NeokudilongaLogo } from "@/components/logo";

export default function QuemSomosPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
                <div className="text-center">
                    <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                        Sobre a Neokudilonga
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Conectando conhecimento e futuro através de livros e tecnologia.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
                    <div>
                        <h2 className="font-headline text-2xl font-semibold">A Nossa Missão</h2>
                        <p className="mt-4 text-muted-foreground">
                            A nossa missão é fornecer materiais educativos de alta qualidade, desde livros escolares a jogos didáticos, para apoiar o percurso de aprendizagem dos estudantes em Angola. Acreditamos que o acesso ao conhecimento é a chave para o desenvolvimento e um futuro mais próspero.
                        </p>
                        <p className="mt-4 text-muted-foreground">
                            Na Neokudilonga, combinamos a tradição das livrarias com a conveniência da tecnologia moderna, criando uma plataforma fácil de usar para pais, estudantes e escolas.
                        </p>
                    </div>
                     <div className="flex items-center justify-center rounded-lg bg-primary/10 p-8">
                        <NeokudilongaLogo className="h-auto w-full max-w-[300px] text-primary" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
                    <div className="order-last md:order-first">
                        <Image 
                            src="https://placehold.co/600x400.png"
                            alt="A nossa equipa"
                            width={600}
                            height={400}
                            className="rounded-lg shadow-md"
                            data-ai-hint="team business"
                        />
                    </div>
                    <div className="order-first md:order-last">
                        <h2 className="font-headline text-2xl font-semibold">A Nossa História</h2>
                        <p className="mt-4 text-muted-foreground">
                           Fundada com a paixão pela educação, a Neokudilonga nasceu da vontade de simplificar o acesso a materiais escolares em Angola. Começámos como uma pequena livraria e, com o tempo, crescemos para nos tornarmos uma referência no setor, sempre focados nas necessidades das nossas comunidades escolares.
                        </p>
                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
}
