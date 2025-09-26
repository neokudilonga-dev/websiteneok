"use client";
import { useEffect, useRef } from "react";
import { useData } from "@/context/data-context";
import { usePathname } from "next/navigation";

export default function RouteLoadingHandler() {
  const { setLoading } = useData();
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for all internal link clicks and set loading immediately
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Only handle left-clicks on anchor tags with href starting with '/'
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (
        anchor &&
        anchor instanceof HTMLAnchorElement &&
        anchor.href &&
        anchor.origin === window.location.origin &&
        anchor.pathname !== window.location.pathname &&
        anchor.getAttribute('target') !== '_blank' &&
        !anchor.hasAttribute('download') &&
        !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
      ) {
        setLoading(true);
      }
    };
    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [setLoading]);

  // Clear loading when the route/pathname changes
  useEffect(() => {
    setLoading(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [pathname, setLoading]);

  // Fallback: clear loading after 5s in case navigation is cancelled
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (typeof window !== 'undefined') {
      timeoutRef.current = setTimeout(() => setLoading(false), 5000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [setLoading]);

  return null;
}
