"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


export function AdminButton() {
    const pathname = usePathname();

    if(pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        asChild
                        variant="secondary"
                        size="icon"
                        className="fixed bottom-6 right-24 z-50 h-14 w-14 rounded-full drop-shadow-lg transition-transform hover:scale-110"
                    >
                        <Link 
                            href="/admin"
                            aria-label="Aceder à área de administração"
                        >
                            <Shield className="h-7 w-7" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Admin Panel</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
