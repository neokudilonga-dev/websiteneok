
"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Gamepad2, ShoppingBag } from "lucide-react";
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
                <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                  {t('landing.hero_title')}
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-foreground/80">
                  {t('landing.hero_subtitle')}
                </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card className="transform transition-transform hover:scale-105 hover:shadow-xl">
                <CardHeader className="items-center text-center">
                    <div className="rounded-full bg-primary/10 p-4 text-primary">
                        <BookOpen className="h-8 w-8" />
                    </div>
                  <CardTitle className="font-headline text-xl">{t('landing.card1_title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    {t('landing.card1_description')}
                  </p>
                   <Button asChild variant="outline" className="mt-4">
                        <Link href="/loja">{t('landing.card1_button')}</Link>
                    </Button>
                </CardContent>
              </Card>
              <Card className="transform transition-transform hover:scale-105 hover:shadow-xl">
                <CardHeader className="items-center text-center">
                     <div className="rounded-full bg-primary/10 p-4 text-primary">
                        <ShoppingBag className="h-8 w-8" />
                    </div>
                  <CardTitle className="font-headline text-xl">{t('landing.card2_title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    {t('landing.card2_description')}
                  </p>
                   <Button asChild variant="outline" className="mt-4">
                        <Link href="/loja?tab=catalogo">{t('landing.card2_button')}</Link>
                    </Button>
                </CardContent>
              </Card>
              <Card className="transform transition-transform hover:scale-105 hover:shadow-xl">
                <CardHeader className="items-center text-center">
                     <div className="rounded-full bg-primary/10 p-4 text-primary">
                        <Gamepad2 className="h-8 w-8" />
                    </div>
                  <CardTitle className="font-headline text-xl">{t('landing.card3_title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    {t('landing.card3_description')}
                  </p>
                   <Button asChild variant="outline" className="mt-4">
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
                <h2 className="font-headline text-3xl font-bold">{t('landing.how_it_works_title')}</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    {t('landing.how_it_works_subtitle')}
                </p>
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <span className="font-bold text-2xl">1</span>
                        </div>
                        <h3 className="font-headline text-xl font-semibold">{t('landing.step1_title')}</h3>
                        <p className="text-muted-foreground">{t('landing.step1_description')}</p>
                    </div>
                     <div className="flex flex-col items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                             <span className="font-bold text-2xl">2</span>
                        </div>
                        <h3 className="font-headline text-xl font-semibold">{t('landing.step2_title')}</h3>
                        <p className="text-muted-foreground">{t('landing.step2_description')}</p>
                    </div>
                     <div className="flex flex-col items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <span className="font-bold text-2xl">3</span>
                        </div>
                        <h3 className="font-headline text-xl font-semibold">{t('landing.step3_title')}</h3>
                        <p className="text-muted-foreground">{t('landing.step3_description')}</p>
                    </div>
                </div>
            </div>
        </section>

      </main>
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-center gap-2 py-6 text-sm text-muted-foreground sm:flex-row sm:gap-4">
          <span>© {year} Neokudilonga. {t('landing.footer_rights')}</span>
          <AdminButton />
        </div>
      </footer>
    </div>
  );
}
