
"use client";

import Link from "next/link";
import Cart from "./cart";
import { NeokudilongaLogo } from "./logo";
import { Button } from "./ui/button";
import { useLanguage } from "@/context/language-context";
import LanguageSwitcher from "./language-switcher";

export default function Header() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-red-500/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <NeokudilongaLogo className="h-16 w-auto" />
          </Link>
        </div>
        <div className="flex items-center justify-end space-x-4">
          <nav className="hidden items-center gap-6 md:flex">
             <Link href="/loja" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {t('header.shop')}
             </Link>
             <Link href="/quem-somos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {t('header.about_us')}
             </Link>
             <Link href="/contactos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {t('header.contact')}
             </Link>
          </nav>
          <div className="flex items-center space-x-2">
            <LanguageSwitcher />
            <Cart />
          </div>
        </div>
      </div>
    </header>
  );
}
