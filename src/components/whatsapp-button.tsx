
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";

export function WhatsAppButton() {
    const pathname = usePathname();

    if(pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <Link 
            href="https://wa.me/244919948887" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Contacte-nos no WhatsApp"
            className="fixed bottom-6 right-6 z-50 text-[#25D366] drop-shadow-lg transition-transform hover:scale-110"
        >
            <FaWhatsapp className="h-16 w-16" />
        </Link>
    )
}
