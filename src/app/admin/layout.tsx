
import Link from "next/link";
import {
  LogOut,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { NeokudilongaLogoAbbr } from "@/components/logo";
import { LogoutButton } from "./logout-button";
import { AdminSidebarMenu } from "./client";


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
            <AdminSidebarMenu />
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
