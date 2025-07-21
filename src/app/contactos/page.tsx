
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Phone, Mail, MapPin } from "lucide-react";
import Header from "@/components/header";

export default function ContactosPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 bg-muted/20">
            <div className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                        Contacte-nos
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Estamos aqui para ajudar. Entre em contacto connosco através de um dos seguintes canais.
                    </p>
                </div>

                <Card className="mt-12">
                    <CardContent className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
                        <div className="space-y-4">
                            <h2 className="font-headline text-2xl font-semibold">Neokudilonga</h2>
                            <p className="text-muted-foreground">
                                A sua fonte de livros e jogos escolares. Comprometidos com a educação e o desenvolvimento em Angola.
                            </p>
                        </div>
                        <div className="space-y-6 rounded-lg bg-muted/50 p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Telefone e WhatsApp</h3>
                                    <p className="text-muted-foreground">Contacte-nos para um atendimento mais rápido.</p>
                                    <a href="https://wa.me/244919948887" target="_blank" rel="noopener noreferrer" className="mt-1 block text-primary hover:underline">
                                        +244 919 948 887
                                    </a>
                                </div>
                            </div>
                             <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Email</h3>
                                    <p className="text-muted-foreground">Para questões formais ou envio de documentos.</p>
                                    <a href="mailto:geral@neokudilonga.co.ao" className="mt-1 block text-primary hover:underline">
                                        geral@neokudilonga.co.ao
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Localização</h3>
                                    <p className="text-muted-foreground">Visite a nossa loja física.</p>
                                    <p className="mt-1 block">
                                        Luanda, Angola
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
