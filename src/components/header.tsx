
"use client";

import Link from "next/link";
import Cart from "./cart";
import { Button } from "@/components/ui/button";
import { BiblioAngolaLogo } from "./logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <BiblioAngolaLogo className="h-8 w-auto" />
          </Link>
          <nav className="hidden gap-6 md:flex">
             <Link href="/quem-somos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Quem Somos
             </Link>
             <Link href="/contactos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Contactos
             </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Cart />
            <Link href="/admin">
              <Button variant="ghost" size="sm">Admin</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
