
"use client";

import Link from "next/link";
import Cart from "./cart";
import { NeokudilongaLogo } from "./logo";
import { Menu } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import LanguageSwitcher from "./language-switcher";
import { Button } from "./ui/button";

export default function Header() {
  const { t } = useLanguage();

  const navLinks = [
    { href: "/loja", label: t('header.shop') },
    { href: "/encomendas", label: t('header.track_order') },
    { href: "/quem-somos", label: t('header.about_us') },
    { href: "/contactos", label: t('header.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <Link href="/" className="flex items-center space-x-2">
            <NeokudilongaLogo className="h-12 w-auto md:h-16" />
          </Link>
        </div>
        <div className="flex items-center justify-end space-x-4">
          <nav className="hidden items-center gap-6 md:flex">
             {navLinks.map((link) => (
               <Link 
                 key={link.href}
                 href={link.href} 
                 className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
               >
                 {link.label}
               </Link>
             ))}
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
