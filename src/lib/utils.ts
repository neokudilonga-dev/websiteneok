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

// Normalize image URLs to a loadable https form.
export function normalizeImageUrl(image?: string): string {
  const fallback = 'https://placehold.co/600x400.png';
  if (!image || typeof image !== 'string') return fallback;

  // Already a web URL
  if (image.startsWith('http://') || image.startsWith('https://')) return image;

  // Convert Firebase Storage gs:// URLs to public https URLs
  if (image.startsWith('gs://')) {
    const match = image.match(/^gs:\/\/([^\/]+)\/(.+)$/);
    if (match) {
      const bucket = match[1];
      const path = match[2];
      const encodedPath = encodeURIComponent(path);
      return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
    }
    return fallback;
  }

  // If it's an unrecognized format (e.g., relative path), fall back
  return fallback;
}
