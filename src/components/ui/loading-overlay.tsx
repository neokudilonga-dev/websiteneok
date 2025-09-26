import React from "react";
import BookLoader from "@/components/ui/book-loader";

export default function LoadingOverlay({ show = false }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 dark:bg-black/70 backdrop-blur-sm transition-opacity">
  <BookLoader size={64} className="text-primary" />
    </div>
  );
}
