
"use client";
import { ReactNode } from "react";
import { CartProvider } from "@/context/cart-context";
import { Toaster } from "@/components/ui/toaster";
import { WhatsAppButton } from "@/components/whatsapp-button";
import LoadingOverlay from "@/components/ui/loading-overlay";
import RouteLoadingHandler from "@/components/ui/route-loading-handler";
import { useGlobalLoading } from "@/context/data-context";


interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const loading = useGlobalLoading();
  return (
    <CartProvider>
      <RouteLoadingHandler />
      <Toaster />
      <WhatsAppButton />
      <LoadingOverlay show={loading} />
      {children}
    </CartProvider>
  );
}


