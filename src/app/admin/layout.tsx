
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Book,
  Building,
  Gamepad2,
  Home,
  School,
  ShoppingCart,
  Tags,
  LogOut,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { NeokudilongaLogoAbbr } from "@/components/logo";
import { useLanguage } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/context/data-context";
import { useEffect } from "react";


export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { loading, fetchData } = useData();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isActive = (path: string) => pathname === path;
  const { t } = useLanguage();

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
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarContent>
            <SidebarHeader>
              <Link
                href="/"
                className="mb-2 flex items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-xl font-semibold outline-none ring-primary focus-visible:ring-2"
              >
                <NeokudilongaLogoAbbr className="size-8" />
              </Link>
            </SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/admin"
                  asChild
                  isActive={isActive("/admin")}
                  tooltip={t('admin_layout.dashboard')}
                >
                  <Link href="/admin">
                    <Home />
                    <span>{t('admin_layout.dashboard')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/admin/books"
                  asChild
                  isActive={isActive("/admin/books")}
                  tooltip={t('admin_layout.books')}
                >
                  <Link href="/admin/books">
                    <Book />
                    <span>{t('admin_layout.books')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/admin/games"
                  asChild
                  isActive={isActive("/admin/games")}
                  tooltip={t('admin_layout.games')}
                >
                  <Link href="/admin/games">
                    <Gamepad2 />
                    <span>{t('admin_layout.games')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/admin/schools"
                  asChild
                  isActive={isActive("/admin/schools")}
                  tooltip={t('admin_layout.schools')}
                >
                  <Link href="/admin/schools">
                    <School />
                    <span>{t('admin_layout.schools')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton
                  href="/admin/categories"
                  asChild
                  isActive={isActive("/admin/categories")}
                  tooltip={t('admin_layout.categories')}
                >
                  <Link href="/admin/categories">
                    <Tags />
                    <span>{t('admin_layout.categories')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/admin/publishers"
                  asChild
                  isActive={isActive("/admin/publishers")}
                  tooltip={t('admin_layout.publishers')}
                >
                  <Link href="/admin/publishers">
                    <Building />
                    <span>{t('admin_layout.publishers')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/admin/orders"
                  asChild
                  isActive={isActive("/admin/orders")}
                  tooltip={t('admin_layout.orders')}
                >
                  <Link href="/admin/orders">
                    <ShoppingCart />
                    <span>{t('admin_layout.orders')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
           <SidebarFooter>
              <SidebarMenu>
                 <SidebarMenuItem>
                   <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                      <LogOut />
                      <span>Logout</span>
                   </SidebarMenuButton>
                 </SidebarMenuItem>
              </SidebarMenu>
           </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger className="sm:hidden" />
            <h1 className="font-headline text-2xl font-semibold">{t('admin_layout.admin_panel')}</h1>
          </header>
          <div className="overflow-x-auto">
            <main className="flex-1 p-4 sm:p-6">
              {loading ? <div className="flex justify-center items-center h-full"><p>Loading admin data...</p></div> : children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
