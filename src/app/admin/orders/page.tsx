
"use client";

import { useState, useMemo } from "react";
import { orders as initialOrders, products as initialProducts, schools } from "@/lib/data";
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
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { OrderReceiptSheet } from "@/components/admin/order-receipt";
import type { Order, Product, School, PaymentStatus, DeliveryStatus } from "@/lib/types";
import { ChevronDown, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setReceiptOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | "all">("all");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<DeliveryStatus | "all">("all");

  const paymentStatusOptions: { value: PaymentStatus; label: string }[] = [
    { value: 'paid', label: 'Pago' },
    { value: 'unpaid', label: 'Não Pago' },
    { value: 'partially_paid', label: 'Pago em Parte' },
    { value: 'cancelled', label: 'Anulado' },
    { value: 'cod', label: 'Pago na Entrega' },
  ];

  const deliveryStatusOptions: { value: DeliveryStatus; label: string }[] = [
    { value: 'delivered', label: 'Entregue' },
    { value: 'not_delivered', label: 'Não Entregue' },
    { value: 'school_pickup', label: 'Entregar na Escola' },
    { value: 'out_of_stock', label: 'Fora de Stock' },
    { value: 'cancelled', label: 'Anulado' },
  ];
  
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const searchMatch = 
        order.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
     setOrders(prevOrders => prevOrders.map(order => 
      order.reference === orderReference ? { ...order, paymentStatus: newStatus } : order
    ));
  };
  
  const handleDeliveryStatusChange = (orderReference: string, newStatus: DeliveryStatus) => {
    const order = orders.find(o => o.reference === orderReference);
    if (!order) return;

    const originalStatus = order.deliveryStatus;
    
    setOrders(prevOrders => prevOrders.map(o => 
      o.reference === orderReference ? { ...o, deliveryStatus: newStatus } : o
    ));

    if (newStatus === 'delivered' && originalStatus !== 'delivered') {
        setProducts(prevProducts => {
          const newProducts = [...prevProducts];
          order.items.forEach(item => {
            const productIndex = newProducts.findIndex(p => p.id === item.id);
            if (productIndex > -1 && newProducts[productIndex].stock !== undefined) {
              newProducts[productIndex].stock! -= item.quantity;
            }
          });
          return newProducts;
        });
    }
  };

  const getSchoolName = (schoolId: string | undefined) => {
    if (!schoolId || schoolId === 'livraria') return 'Livraria (LIV)';
    return schools.find(s => s.id === schoolId)?.name || schoolId;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Encomendas</CardTitle>
          <CardDescription>
            Veja e faça a gestão das suas encomendas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar por ref, aluno..."
                className="w-full rounded-lg bg-background pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
                 <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filtrar por cliente" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Clientes</SelectItem>
                        {schools.map(school => (
                            <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                        ))}
                        <SelectItem value="livraria">Livraria (LIV)</SelectItem>
                    </SelectContent>
                </Select>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <Filter className="mr-2 h-4 w-4" />
                            Filtrar por Estado
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[240px]">
                        <ScrollArea className="h-72">
                            <div className="p-2">
                                <DropdownMenuLabel>Estado do Pagamento</DropdownMenuLabel>
                                <DropdownMenuRadioGroup value={paymentStatusFilter} onValueChange={(val) => setPaymentStatusFilter(val as any)}>
                                    <DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
                                    {paymentStatusOptions.map(opt => <DropdownMenuRadioItem key={opt.value} value={opt.value}>{opt.label}</DropdownMenuRadioItem>)}
                                </DropdownMenuRadioGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Estado da Entrega</DropdownMenuLabel>
                                <DropdownMenuRadioGroup value={deliveryStatusFilter} onValueChange={(val) => setDeliveryStatusFilter(val as any)}>
                                    <DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
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
                <TableHead>Ref. Encomenda</TableHead>
                <TableHead>Aluno / Escola</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado Pagamento</TableHead>
                <TableHead>Estado Entrega</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Ações</span>
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
                    {new Date(order.date).toLocaleDateString("pt-PT")}
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
                      Ver Recibo
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
