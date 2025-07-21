
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Neokudilonga",
  description: "A sua fonte de livros e jogos escolares.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <CartProvider>
          {children}
          <Toaster />
          <Link 
            href="https://wa.me/244919948887" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Contacte-nos no WhatsApp"
            className="fixed bottom-6 right-6 z-50 text-[#25D366] drop-shadow-lg transition-transform hover:scale-110"
          >
            <FaWhatsapp className="h-16 w-16" />
          </Link>
        </CartProvider>
      </body>
    </html>
  );
}
