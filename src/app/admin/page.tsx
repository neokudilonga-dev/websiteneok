
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Book, Gamepad2, School, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { useData } from "@/context/data-context";
import { useMemo } from "react";

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { products, orders, schools } = useData();

  const totalBooks = useMemo(() => products.filter(p => p.type === 'book').length, [products]);
  const totalGames = useMemo(() => products.filter(p => p.type === 'game').length, [products]);
  const activeOrders = useMemo(() => orders.filter(o => o.deliveryStatus !== 'delivered' && o.deliveryStatus !== 'cancelled').length, [orders]);
  const totalSchools = schools.length;


  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.total_books')}</CardTitle>
          <Book className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBooks}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.total_games')}</CardTitle>
          <Gamepad2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalGames}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.active_orders')}</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeOrders}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.schools')}</CardTitle>
          <School className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSchools}</div>
          <p className="text-xs text-muted-foreground">
            {t('dashboard.all_schools_integrated')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
