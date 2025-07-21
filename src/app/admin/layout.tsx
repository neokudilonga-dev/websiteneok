"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Book,
  Gamepad2,
  Home,
  School,
  ShoppingCart,
  BookOpen,
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
} from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarContent>
            <SidebarHeader>
              <Link
                href="/"
                className="mb-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xl font-semibold outline-none ring-primary focus-visible:ring-2"
              >
                <BookOpen className="size-6 text-primary" />
                <span className="font-headline">BiblioAngola</span>
              </Link>
            </SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/admin"
                  asChild
                  isActive={isActive("/admin")}
                  tooltip="Dashboard"
                >
                  <Link href="/admin">
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/admin/books"
                  asChild
                  isActive={isActive("/admin/books")}
                  tooltip="Books"
                >
                  <Link href="/admin/books">
                    <Book />
                    <span>Books</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/admin/games"
                  asChild
                  isActive={isActive("/admin/games")}
                  tooltip="Games"
                >
                  <Link href="/admin/games">
                    <Gamepad2 />
                    <span>Games</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/admin/schools"
                  asChild
                  isActive={isActive("/admin/schools")}
                  tooltip="Schools"
                >
                  <Link href="/admin/schools">
                    <School />
                    <span>Schools</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/admin/orders"
                  asChild
                  isActive={isActive("/admin/orders")}
                  tooltip="Orders"
                >
                  <Link href="/admin/orders">
                    <ShoppingCart />
                    <span>Orders</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="sm:hidden" />
            <h1 className="font-headline text-2xl font-semibold">Admin Dashboard</h1>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
