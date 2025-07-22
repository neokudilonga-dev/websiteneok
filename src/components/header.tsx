
"use client";

import Link from "next/link";
import Cart from "./cart";
import { BiblioAngolaLogo } from "./logo";
import { Button } from "./ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <BiblioAngolaLogo className="h-16 w-auto" />
          </Link>
        </div>
        <div className="flex items-center justify-end space-x-4">
          <nav className="hidden items-center gap-6 md:flex">
             <Link href="/quem-somos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Quem Somos
             </Link>
             <Link href="/contactos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Contactos
             </Link>
          </nav>
          <div className="flex items-center space-x-2">
            <Cart />
          </div>
        </div>
      </div>
    </header>
  );
}
