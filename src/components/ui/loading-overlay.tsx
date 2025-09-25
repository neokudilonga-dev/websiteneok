import React from "react";
import Spinner from "@/components/ui/spinner";

export default function LoadingOverlay({ show = false }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 dark:bg-black/70 backdrop-blur-sm transition-opacity">
      <Spinner size={64} className="text-primary" />
    </div>
  );
}
