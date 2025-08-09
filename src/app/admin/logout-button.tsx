"use client";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../../lib/firebase";

export function LogoutButton() {
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = async () => {
        try {
            const auth = getAuth(app);
            const user = auth.currentUser;

            if (user) {
                await user.delete();
                console.log("User deleted from Firebase.");
            }

            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (response.ok) {
                toast({ title: "User deleted and logged out successfully." });
                router.push("/admin/login");
            } else {
                throw new Error("Failed to clear backend session.");
            }
        } catch (error: any) {
            console.error("Logout/Delete error:", error);

            if (error.code === "auth/requires-recent-login") {
                toast({
                    title: "Deletion failed",
                    description: "You need to re-authenticate before deleting your account.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Logout failed",
                    description: "An error occurred during logout or deletion.",
                    variant: "destructive",
                });
            }
        }
    };

    return (
        <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
            <LogOut />
            <span>Logout</span>
        </SidebarMenuButton>
    );
}
