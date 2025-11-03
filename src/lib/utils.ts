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

  // Web URL: sanitize Firebase Storage URLs that may be malformed
  if (image.startsWith('http://') || image.startsWith('https://')) {
    // If it's a Firebase Storage URL, fix common issues:
    // - Wrong bucket suffix (.firebasestorage.app -> .appspot.com)
    // - Duplicate or noisy query params (ensure only alt=media and token)
    if (/^https?:\/\/firebasestorage\.googleapis\.com\//.test(image)) {
      // Fix bucket name if incorrectly saved
      let cleaned = image.replace(
        /\/v0\/b\/([^\/]+)\.firebasestorage\.app\/o\//,
        (_m, bucket) => `/v0/b/${bucket}.appspot.com/o/`
      );

      // Reconstruct query params safely
      const qIndex = cleaned.indexOf('?');
      const base = qIndex >= 0 ? cleaned.slice(0, qIndex) : cleaned;
      const rest = qIndex >= 0 ? cleaned.slice(qIndex + 1).split('?')[0] : '';

      const params = new URLSearchParams(rest);
      const token = params.get('token') || '';
      const finalQuery = token ? `alt=media&token=${token}` : 'alt=media';
      return `${base}?${finalQuery}`;
    }

    // Non-Firebase http(s) URL
    return image;
  }

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
