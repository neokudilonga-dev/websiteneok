
"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
import { getDisplayName, normalizeSearch } from "@/lib/utils";

import { useState, useMemo, useEffect } from "react";
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
import type { Order, PaymentStatus, DeliveryStatus, School } from "@/lib/types";
import { ChevronDown, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useData } from "@/context/data-context";
import { useLanguage } from "@/context/language-context";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface OrdersPageClientProps {
    initialOrders: Order[];
    initialSchools: School[];
}

export default function OrdersPageClient({ initialOrders, initialSchools }: OrdersPageClientProps) {
  const { orders, schools, updateOrderPaymentStatus, updateOrderDeliveryStatus, updateOrderDeliveryDate, setOrders, setSchools, deleteOrder } = useData();
  const { t, language } = useLanguage();

  useEffect(() => {
    setOrders(initialOrders);
    setSchools(initialSchools);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrders, initialSchools]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setReceiptOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(new Set());

  const handleDeleteOrder = async () => {
    if (orderToDelete) {
      await deleteOrder(orderToDelete.reference);
      setOrderToDelete(null);
    }
  };

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
    if (!orders) return [];
    const normalizedSearch = normalizeSearch(searchQuery);
    return orders.filter(order => {
      const searchMatch = 
        normalizeSearch(order.reference).includes(normalizedSearch) ||
        (order.studentName && normalizeSearch(order.studentName).includes(normalizedSearch)) ||
        normalizeSearch(order.guardianName).includes(normalizedSearch);
      
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

  const handleDeliveryDateChange = (orderReference: string, newDate: string) => {
    updateOrderDeliveryDate(orderReference, newDate);
  };

  const getSchoolName = (schoolId: string | undefined) => {
    if (!schoolId || schoolId === 'livraria') return t('orders_page.bookstore_client');
    const school = schools.find(s => s.id === schoolId)
    return school ? getDisplayName(school.name, language) : schoolId;
  }

  const toggleSelectOrder = (reference: string) => {
    setSelectedRefs(prev => {
      const next = new Set(prev);
      if (next.has(reference)) next.delete(reference);
      else next.add(reference);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedRefs(prev => {
      if (prev.size === filteredOrders.length) return new Set();
      const next = new Set<string>();
      filteredOrders.forEach(o => next.add(o.reference));
      return next;
    });
  };

  const renderReceiptElement = (order: Order) => {
    const container = document.createElement('div');
    container.style.width = '210mm';
    container.style.padding = '16px';
    container.style.background = 'white';
    container.style.color = 'black';
    container.style.border = '1px solid #000';
    container.style.fontSize = '12px';
    container.style.lineHeight = '1.5';
    container.style.minWidth = '210mm';

    const tableRow = (label: string, value: string) => {
      const row = document.createElement('div');
      row.style.display = 'grid';
      row.style.gridTemplateColumns = '1fr 1fr';
      row.style.border = '1px solid #000';
      const cell1 = document.createElement('div');
      cell1.style.fontWeight = 'bold';
      cell1.style.padding = '8px';
      cell1.style.borderRight = '1px solid #000';
      cell1.textContent = label;
      const cell2 = document.createElement('div');
      cell2.style.padding = '8px';
      cell2.textContent = value;
      row.appendChild(cell1);
      row.appendChild(cell2);
      return row;
    };

    const paymentMethodLabel = () => {
      if (order.paymentMethod === 'transferencia') return t('checkout_form.payment_method_3');
      if (order.paymentMethod === 'multicaixa') return t('checkout_form.payment_method_2');
      if (order.paymentMethod === 'numerario') return t('checkout_form.payment_method_1');
      return order.paymentMethod;
    };

    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.marginBottom = '8px';
    header.textContent = 'NEOKUDILONGA';
    container.appendChild(header);

    container.appendChild(tableRow(t('receipt.school'), order.schoolName || 'N/A'));
    container.appendChild(tableRow(t('receipt.student_name'), order.studentName || ''));
    container.appendChild(tableRow(t('receipt.guardian_name'), order.guardianName));
    container.appendChild(tableRow(t('receipt.reference'), order.reference));
    container.appendChild(tableRow(t('receipt.phone'), order.phone));
    container.appendChild(tableRow(t('receipt.delivery_address'), order.deliveryAddress || 'N/A'));
    container.appendChild(tableRow(t('receipt.payment_method'), paymentMethodLabel()));

    const orderTable = document.createElement('table');
    orderTable.style.width = '100%';
    orderTable.style.borderCollapse = 'collapse';
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    const th1 = document.createElement('th');
    th1.textContent = t('receipt.order') + ':';
    th1.style.textAlign = 'left';
    th1.style.border = '1px solid #000';
    th1.style.padding = '8px';
    const th2 = document.createElement('th');
    th2.textContent = t('receipt.price_kz');
    th2.style.textAlign = 'right';
    th2.style.border = '1px solid #000';
    th2.style.padding = '8px';
    headRow.appendChild(th1);
    headRow.appendChild(th2);
    thead.appendChild(headRow);
    orderTable.appendChild(thead);

    const tbody = document.createElement('tbody');
    order.items.forEach(item => {
      const tr = document.createElement('tr');
      const td1 = document.createElement('td');
      td1.textContent = getDisplayName(item.name, language);
      td1.style.border = '1px solid #000';
      td1.style.padding = '8px';
      const td2 = document.createElement('td');
      td2.textContent = `${item.price.toLocaleString('pt-PT')}Kz`;
      td2.style.border = '1px solid #000';
      td2.style.padding = '8px';
      td2.style.textAlign = 'right';
      tr.appendChild(td1);
      tr.appendChild(td2);
      tbody.appendChild(tr);
    });
    const deliveryRow = document.createElement('tr');
    const dtd1 = document.createElement('td');
    dtd1.textContent = t('receipt.home_delivery');
    dtd1.style.border = '1px solid #000';
    dtd1.style.padding = '8px';
    const dtd2 = document.createElement('td');
    dtd2.textContent = `${order.deliveryFee.toLocaleString('pt-PT')}Kz`;
    dtd2.style.border = '1px solid #000';
    dtd2.style.padding = '8px';
    dtd2.style.textAlign = 'right';
    deliveryRow.appendChild(dtd1);
    deliveryRow.appendChild(dtd2);
    tbody.appendChild(deliveryRow);
    const totalRow = document.createElement('tr');
    const ttd1 = document.createElement('td');
    ttd1.textContent = t('receipt.total');
    ttd1.style.border = '1px solid #000';
    ttd1.style.padding = '8px';
    ttd1.style.fontWeight = 'bold';
    const ttd2 = document.createElement('td');
    ttd2.textContent = `${order.total.toLocaleString('pt-PT')}Kz`;
    ttd2.style.border = '1px solid #000';
    ttd2.style.padding = '8px';
    ttd2.style.textAlign = 'right';
    ttd2.style.fontWeight = 'bold';
    totalRow.appendChild(ttd1);
    totalRow.appendChild(ttd2);
    tbody.appendChild(totalRow);
    orderTable.appendChild(tbody);
    container.appendChild(orderTable);

    return container;
  };

  const downloadSelectedReceipts = async () => {
    if (selectedRefs.size === 0) return;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let first = true;
    for (const ref of Array.from(selectedRefs)) {
      const order = orders.find(o => o.reference === ref);
      if (!order) continue;
      const el = renderReceiptElement(order);
      document.body.appendChild(el);
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      document.body.removeChild(el);
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
      const imgX = (pdfWidth - canvas.width * ratio) / 2;
      if (!first) pdf.addPage();
      first = false;
      pdf.addImage(imgData, 'PNG', imgX, 10, canvas.width * ratio, canvas.height * ratio);
    }
    pdf.save('receipts.pdf');
  };

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
                            <SelectItem key={school.id} value={school.id}>{getDisplayName(school.name, language)}</SelectItem>
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
            <div className="flex w-full sm:w-auto">
              <Button onClick={downloadSelectedReceipts} disabled={selectedRefs.size === 0}>
                {t('receipt.download_pdf')}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input
                    type="checkbox"
                    aria-label="select all"
                    checked={selectedRefs.size === filteredOrders.length && filteredOrders.length > 0}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>{t('orders_page.order_ref')}</TableHead>
                <TableHead>{t('orders_page.student_school')}</TableHead>
                <TableHead>{t('common.date')}</TableHead>
                <TableHead>{t('common.total')}</TableHead>
                <TableHead>{t('orders_page.payment_status')}</TableHead>
                <TableHead>{t('orders_page.delivery_status')}</TableHead>
                <TableHead>{t('common.delivery_date')}</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">{t('common.actions')}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.reference}>
                  <TableCell>
                    <input
                      type="checkbox"
                      aria-label={`select ${order.reference}`}
                      checked={selectedRefs.has(order.reference)}
                      onChange={() => toggleSelectOrder(order.reference)}
                    />
                  </TableCell>
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
                  <TableCell>
                    <Input 
                      type="date" 
                      className="w-[150px]" 
                      value={order.deliveryDate || ""} 
                      onChange={(e) => handleDeliveryDateChange(order.reference, e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">{t('common.open_menu')}</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => viewReceipt(order)}>
                          {t('orders_page.view_receipt')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setOrderToDelete(order)} className="text-red-600">
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('orders_page.confirm_delete_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('orders_page.confirm_delete_description', { orderRef: orderToDelete?.reference || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} className="bg-red-600 hover:bg-red-700">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
