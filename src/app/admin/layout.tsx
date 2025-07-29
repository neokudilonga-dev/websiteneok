
import Link from "next/link";
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
import { LogoutButton } from "./logout-button";
import AdminLayoutClient from "./client";


export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <AdminLayoutClient>
              <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      href="/admin"
                      asChild
                      // isActive={isActive("/admin")}
                      tooltip={'Dashboard'}
                    >
                      <Link href="/admin">
                        <Home />
                        <span>{'Dashboard'}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      href="/admin/books"
                      asChild
                      // isActive={isActive("/admin/books")}
                      tooltip={'Books'}
                    >
                      <Link href="/admin/books">
                        <Book />
                        <span>{'Books'}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      href="/admin/games"
                      asChild
                      // isActive={isActive("/admin/games")}
                      tooltip={'Games'}
                    >
                      <Link href="/admin/games">
                        <Gamepad2 />
                        <span>{'Games'}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      href="/admin/schools"
                      asChild
                      // isActive={isActive("/admin/schools")}
                      tooltip={'Schools'}
                    >
                      <Link href="/admin/schools">
                        <School />
                        <span>{'Schools'}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      href="/admin/categories"
                      asChild
                      // isActive={isActive("/admin/categories")}
                      tooltip={'Categories'}
                    >
                      <Link href="/admin/categories">
                        <Tags />
                        <span>{'Categories'}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      href="/admin/publishers"
                      asChild
                      // isActive={isActive("/admin/publishers")}
                      tooltip={'Publishers'}
                    >
                      <Link href="/admin/publishers">
                        <Building />
                        <span>{'Publishers'}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      href="/admin/orders"
                      asChild
                      // isActive={isActive("/admin/orders")}
                      tooltip={'Orders'}
                    >
                      <Link href="/admin/orders">
                        <ShoppingCart />
                        <span>{'Orders'}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
            </AdminLayoutClient>
          </SidebarContent>
           <SidebarFooter>
              <SidebarMenu>
                 <SidebarMenuItem>
                   <LogoutButton />
                 </SidebarMenuItem>
              </SidebarMenu>
           </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger className="sm:hidden" />
            <h1 className="font-headline text-2xl font-semibold">Admin Panel</h1>
          </header>
          <div className="overflow-x-auto">
            <main className="flex-1 p-4 sm:p-6">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
