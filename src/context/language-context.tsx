
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { pt } from '@/lib/i18n/locales/pt';
import { en } from '@/lib/i18n/locales/en';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const translations = { pt, en };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper function to get nested keys
const getNestedValue = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    const storedLang = localStorage.getItem('language') as Language | null;
    if (storedLang && (storedLang === 'pt' || storedLang === 'en')) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = useCallback((key: string, options?: { [key: string]: string | number }) => {
    let translation = getNestedValue(translations[language], key);

    if (!translation) {
      // Fallback to Portuguese if translation is not found
      translation = getNestedValue(translations.pt, key);
    }

    if (!translation) {
      console.warn(`Translation for key '${key}' not found.`);
      return key;
    }

    if (options) {
      Object.keys(options).forEach(optKey => {
        translation = translation!.replace(`{{${optKey}}}`, String(options[optKey]));
      });
    }

    return translation;
  }, [language]);
  

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
