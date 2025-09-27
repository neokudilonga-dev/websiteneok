"use client";

import { usePathname } from "next/navigation";
import {
  Book,
  Building,
  Gamepad2,
  Home,
  School,
  ShoppingCart,
  Tags,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";

export function AdminSidebarMenu() {
    const pathname = usePathname();
    const { t } = useLanguage(); // eslint-disable-line @typescript-eslint/no-unused-vars

    const isActive = (path: string) => pathname === path;
    const isPartiallyActive = (path: string) => pathname.startsWith(path);

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                asChild
                isActive={isActive("/admin")}
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
                asChild
                isActive={isPartiallyActive("/admin/books")}
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
                asChild
                isActive={isPartiallyActive("/admin/games")}
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
                asChild
                isActive={isPartiallyActive("/admin/schools")}
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
                asChild
                isActive={isPartiallyActive("/admin/categories")}
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
                asChild
                isActive={isPartiallyActive("/admin/publishers")}
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
                asChild
                isActive={isPartiallyActive("/admin/orders")}
                tooltip={'Orders'}
                >
                <Link href="/admin/orders">
                    <ShoppingCart />
                    <span>{'Orders'}</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
