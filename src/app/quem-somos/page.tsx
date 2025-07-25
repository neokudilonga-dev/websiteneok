
"use client";

import Image from "next/image";
import Header from "@/components/header";
import { NeokudilongaLogo } from "@/components/logo";
import { useLanguage } from "@/context/language-context";

export default function QuemSomosPage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
                <div className="text-center">
                    <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
                        {t('about_us.title')}
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        {t('about_us.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
                    <div>
                        <h2 className="font-headline text-2xl font-semibold">{t('about_us.mission_title')}</h2>
                        <p className="mt-4 text-muted-foreground">
                            {t('about_us.mission_p1')}
                        </p>
                        <p className="mt-4 text-muted-foreground">
                            {t('about_us.mission_p2')}
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
                        <h2 className="font-headline text-2xl font-semibold">{t('about_us.history_title')}</h2>
                        <p className="mt-4 text-muted-foreground">
                           {t('about_us.history_p1')}
                        </p>
                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
}
