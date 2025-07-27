
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { OrderReceiptSheet } from "@/components/admin/order-receipt";
import type { Order, PaymentStatus, DeliveryStatus } from "@/lib/types";
import { ChevronDown, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useData } from "@/context/data-context";
import { useLanguage } from "@/context/language-context";

export default function OrdersPage() {
  const { orders, schools, updateOrderPaymentStatus, updateOrderDeliveryStatus } = useData();
  const { t, language } = useLanguage();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setReceiptOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | "all">("all");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<DeliveryStatus | "all">("all");

  const paymentStatusOptions: { value: PaymentStatus; label: string }[] = [
    { value: 'paid', label: t('payment_status.paid') },
    { value: 'unpaid', label: t('payment_status.unpaid') },
    { value: 'partially_paid', label: t('payment_status.partially_paid') },
    { value: 'cancelled', label: t('payment_status.cancelled') },
    { value: 'cod', label: t('payment_status.cod') },
  ];

  const deliveryStatusOptions: { value: DeliveryStatus; label: string }[] = [
    { value: 'delivered', label: t('delivery_status.delivered') },
    { value: 'not_delivered', label: t('delivery_status.not_delivered') },
    { value: 'school_pickup', label: t('delivery_status.school_pickup') },
    { value: 'out_of_stock', label: t('delivery_status.out_of_stock') },
    { value: 'cancelled', label: t('delivery_status.cancelled') },
  ];
  
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const searchMatch = 
        order.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.studentName && order.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        order.guardianName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const schoolMatch = schoolFilter === 'all' || order.schoolId === schoolFilter;
      const paymentStatusMatch = paymentStatusFilter === 'all' || order.paymentStatus === paymentStatusFilter;
      const deliveryStatusMatch = deliveryStatusFilter === 'all' || order.deliveryStatus === deliveryStatusFilter;

      return searchMatch && schoolMatch && paymentStatusMatch && deliveryStatusMatch;
    });
  }, [orders, searchQuery, schoolFilter, paymentStatusFilter, deliveryStatusFilter]);


  const viewReceipt = (order: Order) => {
    setSelectedOrder(order);
    setReceiptOpen(true);
  };
  
  const handlePaymentStatusChange = (orderReference: string, newStatus: PaymentStatus) => {
     updateOrderPaymentStatus(orderReference, newStatus);
  };
  
  const handleDeliveryStatusChange = (orderReference: string, newStatus: DeliveryStatus) => {
    updateOrderDeliveryStatus(orderReference, newStatus);
  };

  const getSchoolName = (schoolId: string | undefined) => {
    if (!schoolId || schoolId === 'livraria') return t('orders_page.bookstore_client');
    const school = schools.find(s => s.id === schoolId)
    return school ? (school.name[language] || school.name.pt) : schoolId;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('orders_page.title')}</CardTitle>
          <CardDescription>{t('orders_page.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('orders_page.search_placeholder')}
                className="w-full rounded-lg bg-background pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
                 <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder={t('orders_page.filter_by_client')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('orders_page.all_clients')}</SelectItem>
                        {schools.map(school => (
                            <SelectItem key={school.id} value={school.id}>{school.name[language] || school.name.pt}</SelectItem>
                        ))}
                        <SelectItem value="livraria">{t('orders_page.bookstore_client')}</SelectItem>
                    </SelectContent>
                </Select>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <Filter className="mr-2 h-4 w-4" />
                            {t('orders_page.filter_by_status')}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[240px]">
                        <ScrollArea className="h-72">
                            <div className="p-2">
                                <DropdownMenuLabel>{t('orders_page.payment_status')}</DropdownMenuLabel>
                                <DropdownMenuRadioGroup value={paymentStatusFilter} onValueChange={(val) => setPaymentStatusFilter(val as any)}>
                                    <DropdownMenuRadioItem value="all">{t('common.all')}</DropdownMenuRadioItem>
                                    {paymentStatusOptions.map(opt => <DropdownMenuRadioItem key={opt.value} value={opt.value}>{opt.label}</DropdownMenuRadioItem>)}
                                </DropdownMenuRadioGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>{t('orders_page.delivery_status')}</DropdownMenuLabel>
                                <DropdownMenuRadioGroup value={deliveryStatusFilter} onValueChange={(val) => setDeliveryStatusFilter(val as any)}>
                                    <DropdownMenuRadioItem value="all">{t('common.all')}</DropdownMenuRadioItem>
                                    {deliveryStatusOptions.map(opt => <DropdownMenuRadioItem key={opt.value} value={opt.value}>{opt.label}</DropdownMenuRadioItem>)}
                                </DropdownMenuRadioGroup>
                            </div>
                        </ScrollArea>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('orders_page.order_ref')}</TableHead>
                <TableHead>{t('orders_page.student_school')}</TableHead>
                <TableHead>{t('common.date')}</TableHead>
                <TableHead>{t('common.total')}</TableHead>
                <TableHead>{t('orders_page.payment_status')}</TableHead>
                <TableHead>{t('orders_page.delivery_status')}</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">{t('common.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.reference}>
                  <TableCell className="font-mono text-xs">{order.reference}</TableCell>
                  <TableCell>
                    <div className="font-medium">{order.studentName || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">{getSchoolName(order.schoolId)}</div>
                  </TableCell>
                  <TableCell>
                    {new Date(order.date).toLocaleDateString(language)}
                  </TableCell>
                  <TableCell>
                    {order.total.toLocaleString("pt-PT", {
                      style: "currency",
                      currency: "AOA",
                      minimumFractionDigits: 0, 
                      maximumFractionDigits: 0
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-[150px] justify-between capitalize">
                                <span>{paymentStatusOptions.find(o => o.value === order.paymentStatus)?.label}</span>
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {paymentStatusOptions.map(opt => (
                                <DropdownMenuItem key={opt.value} onClick={() => handlePaymentStatusChange(order.reference, opt.value)}>
                                    {opt.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-[150px] justify-between capitalize">
                               <span>{deliveryStatusOptions.find(o => o.value === order.deliveryStatus)?.label}</span>
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {deliveryStatusOptions.map(opt => (
                                <DropdownMenuItem key={opt.value} onClick={() => handleDeliveryStatusChange(order.reference, opt.value)}>
                                    {opt.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewReceipt(order)}
                    >
                      {t('orders_page.view_receipt')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
      {selectedOrder && (
        <OrderReceiptSheet
          isOpen={isReceiptOpen}
          setIsOpen={setReceiptOpen}
          order={selectedOrder}
        />
      )}
    </>
  );
}
