
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin } from "lucide-react";
import Header from "@/components/header";
import { useLanguage } from "@/context/language-context";

export default function ContactosPage() {
  const { t } = useLanguage();
  
  return (
    <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 bg-muted/20">
            <div className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                        {t('contact_page.title')}
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        {t('contact_page.description')}
                    </p>
                </div>

                <Card className="mt-12">
                    <CardContent className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
                        <div className="space-y-4">
                            <h2 className="font-headline text-2xl font-semibold">Neokudilonga</h2>
                            <p className="text-muted-foreground">
                                {t('contact_page.company_description')}
                            </p>
                        </div>
                        <div className="space-y-6 rounded-lg bg-muted/50 p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">WhatsApp</h3>
                                    <p className="text-muted-foreground">{t('contact_page.whatsapp_description')}</p>
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
                                    <p className="text-muted-foreground">{t('contact_page.email_description')}</p>
                                    <a href="mailto:neokudilonga@gmail.com" className="mt-1 block text-primary hover:underline">
                                        neokudilonga@gmail.com
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">{t('contact_page.location')}</h3>
                                    <p className="text-muted-foreground">{t('contact_page.location_description')}</p>
                                    <p className="mt-1 block">
                                        {t('contact_page.address')}
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
