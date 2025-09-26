import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Language = 'pt' | 'en';

export function getDisplayName(name: string | { pt: string; en: string; } | undefined, language: Language): string {
  if (!name) {
    return "Product Image"; // Default fallback
  }
  if (typeof name === 'string') {
    return name;
  }
  return name[language] || name.pt || "Product Image";
}
