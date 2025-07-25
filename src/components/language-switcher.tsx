
"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language-context";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center rounded-md border p-1">
      <Button
        variant={language === 'pt' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-auto px-3 py-1 text-xs"
        onClick={() => setLanguage('pt')}
      >
        PT
      </Button>
      <Button
        variant={language === 'en' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-auto px-3 py-1 text-xs"
        onClick={() => setLanguage('en')}
      >
        EN
      </Button>
    </div>
  );
}
