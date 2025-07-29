
"use client";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";

export function LogoutButton() {
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = async () => {
        try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
        });

        if (response.ok) {
            toast({ title: "Logged out successfully." });
            router.push('/admin/login');
        } else {
            throw new Error('Logout failed');
        }
        } catch (error) {
        console.error("Logout error:", error);
        toast({
            title: "Logout failed",
            description: "An error occurred during logout. Please try again.",
            variant: "destructive",
        });
        }
    };

    return (
        <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
            <LogOut />
            <span>Logout</span>
        </SidebarMenuButton>
    )
}
