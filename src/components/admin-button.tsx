
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminButton() {
    const pathname = usePathname();

    if(pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <Button 
            asChild
            variant="ghost"
            size="sm"
        >
            <Link 
                href="/admin"
                aria-label="Aceder à área de administração"
            >
                <Shield className="h-4 w-4 mr-2" />
                Admin
            </Link>
        </Button>
    )
}
