
"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("@/components/header"), {
  ssr: false,
});
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Gamepad2, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { AdminButton } from "@/components/admin-button";

export default function LandingPage() {
  const { t } = useLanguage();
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex min-h-dvh w-full flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex min-h-dvh w-full flex-col justify-center bg-muted/20">
          <div className="container relative z-10 flex h-full flex-col justify-center gap-12 text-center">
            <div className="flex flex-col items-center">
                <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  {t('landing.hero_title')}
                </h1>
                <p className="mt-4 max-w-2xl text-xl text-foreground">
                  {t('landing.hero_subtitle')}
                </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card className="hover:shadow-xl">
                <CardHeader className="items-center text-center">
                    <div className="rounded-full bg-primary/10 p-4 text-primary">
                        <BookOpen className="h-8 w-8" />
                    </div>
                  <CardTitle className="font-headline text-2xl font-semibold">{t('landing.card1_title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-base text-foreground/90">
                  <p>
                    {t('landing.card1_description')}
                  </p>
                   <Button asChild variant="outline" className="mt-6 text-[var(--link-color)] hover:text-[var(--link-hover-color)]">
                        <Link href="/loja">{t('landing.card1_button')}</Link>
                    </Button>
                </CardContent>
              </Card>
              <Card className="transform transition-transform hover:scale-105 shadow-[var(--box-shadow)]">
                <CardHeader className="items-center text-center">
                     <div className="rounded-full bg-primary/10 p-4 text-primary">
                        <ShoppingBag className="h-8 w-8" />
                    </div>
                  <CardTitle className="font-headline text-2xl font-semibold">{t('landing.card2_title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-base text-foreground/90">
                  <p>
                    {t('landing.card2_description')}
                  </p>
                   <Button asChild variant="outline" className="mt-6 text-[var(--link-color)] hover:text-[var(--link-hover-color)]">
                        <Link href="/loja?tab=catalogo">{t('landing.card2_button')}</Link>
                    </Button>
                </CardContent>
              </Card>
              <Card className="transform transition-transform hover:scale-105 shadow-[var(--box-shadow)]">
                <CardHeader className="items-center text-center">
                     <div className="rounded-full bg-primary/10 p-4 text-primary">
                        <Gamepad2 className="h-8 w-8" />
                    </div>
                  <CardTitle className="font-headline text-2xl font-semibold">{t('landing.card3_title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-base text-foreground/90">
                  <p>
                    {t('landing.card3_description')}
                  </p>
                   <Button asChild variant="outline" className="mt-6 text-[var(--link-color)] hover:text-[var(--link-hover-color)]">
                        <Link href="/loja?tab=jogos">{t('landing.card3_button')}</Link>
                    </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
         {/* How it works Section */}
        <section className="bg-muted/40 py-12 sm:py-16 lg:py-24">
            <div className="container text-center">
                <h2 className="font-headline text-3xl font-bold sm:text-4xl md:text-5xl">{t('landing.how_it_works_title')}</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/90">
                    {t('landing.how_it_works_subtitle')}
                </p>
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
                            <span className="font-bold text-2xl">1</span>
                        </div>
                        <h3 className="font-headline text-xl font-semibold">{t('landing.step1_title')}</h3>
                        <p className="text-foreground/80">{t('landing.step1_description')}</p>
                    </div>
                     <div className="flex flex-col items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
                             <span className="font-bold text-2xl">2</span>
                        </div>
                        <h3 className="font-headline text-xl font-semibold">{t('landing.step2_title')}</h3>
                        <p className="text-foreground/80">{t('landing.step2_description')}</p>
                    </div>
                     <div className="flex flex-col items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg">
                            <span className="font-bold text-2xl">3</span>
                        </div>
                        <h3 className="font-headline text-xl font-semibold">{t('landing.step3_title')}</h3>
                        <p className="text-foreground/80">{t('landing.step3_description')}</p>
                    </div>
                </div>
            </div>
        </section>

      </main>
      <footer className="border-t bg-muted/40 py-8">
        <div className="container flex flex-col items-center justify-between gap-8 text-sm text-foreground/80 md:flex-row">
          <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
            <p className="text-lg font-semibold">Contactos</p>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="h-5 w-5"><path d="M380.9 97.1C339.4 55.6 283.8 32 224 32S108.6 55.6 67.1 97.1 32 190.2 32 250.2c0 50.5 16.4 95.6 47.9 130.7L32 480l118.7-31c29.9 16.6 63.1 25.3 93.3 25.3 59.8 0 115.4-23.6 156.9-65.1S416 310.2 416 250.2s-23.6-115.4-65.1-156.9zM224 416c-26.7 0-52.7-7.2-75.5-21.1L112 400l-20-74.5c-20.7-37.8-31.5-80.6-31.5-125.7C60.5 132.5 132.5 60.5 224 60.5s163.5 72 163.5 163.5c0 91.5-72 163.5-163.5 163.5zm50.2-148.7c-2.9-1.5-17.2-8.5-19.9-9.5-2.7-1.1-4.7-1.6-6.7 1.6-2 3.2-7.7 9.5-9.4 11.4-1.7 1.9-3.4 2.1-6.3 .6-3.7-1.9-15.7-5.8-29.9-18.5-11.1-9.9-18.5-22.1-20.7-25.8-2.2-3.7-.2-5.7 1.4-7.3 1.4-1.4 3.2-3.7 4.7-5.5 1.5-1.9 2-3.2 3-5.2 1-2 0-3.7-.9-5.5-1.8-1.9-17.2-41.5-23.6-56.7-6.4-15.2-12.9-13.1-17.2-13.4-4.2-.3-9-.2-13.9-.2-4.9 0-12.9 1.9-19.6 9.5-6.7 7.6-25.6 25.1-25.6 61.3 0 36.2 26.2 71.3 30 76.2 3.8 4.9 51.7 78.9 125.4 109.8 73.6 30.9 73.6 20.6 87 18.3 13.4-2.3 42.4-17.2 48.4-34.1 6-16.9 6-15.7 4.2-18.3-1.8-2.6-6.7-4.2-14.2-8.1z" fill="#25D366"/></svg>
              <span>+244 919 948 887</span>
            </div>
            <div className="flex items-center gap-2">
              <img src="/email-icon.svg" alt="Email" className="h-5 w-5" />
              <span>neokudilonga@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <img src="/location-icon.svg" alt="Location" className="h-5 w-5" />
              <span>{t('contact_page.address')}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 md:items-end">
            <p>© {year} Neokudilonga. {t('landing.footer_rights')}</p>
            <AdminButton />
          </div>
        </div>
      </footer>
    </div>
  );
}
