
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
                        <div className="h-[400px] w-full">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3941.6706000000003!2d13.1945209!3d-8.888589!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwNTMnMTguOSJTIDEzwrAxMSc0OS41IkU!5e0!3m2!1sen!2sao!4v1678912345678!5m2!1sen!2sao"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
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
