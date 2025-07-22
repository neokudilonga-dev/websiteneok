
"use client";

import { useState } from "react";
import { orders as initialOrders, products as initialProducts } from "@/lib/data";
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
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderReceiptSheet } from "@/components/admin/order-receipt";
import type { Order, Product } from "@/lib/types";
import { ChevronDown } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setReceiptOpen] = useState(false);

  const viewReceipt = (order: Order) => {
    setSelectedOrder(order);
    setReceiptOpen(true);
  };
  
  const handleStatusChange = (orderReference: string, newStatus: "pending" | "completed") => {
    const originalStatus = orders.find(o => o.reference === orderReference)?.status;
    
    setOrders(prevOrders => prevOrders.map(order => 
      order.reference === orderReference ? { ...order, status: newStatus } : order
    ));

    // Only deduct stock if status changes to completed from something else
    if (newStatus === 'completed' && originalStatus !== 'completed') {
      const order = orders.find(o => o.reference === orderReference);
      if (order) {
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
    }
  };

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref. Encomenda</TableHead>
                <TableHead>Aluno</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.reference}>
                  <TableCell className="font-mono text-xs">{order.reference}</TableCell>
                  <TableCell className="font-medium">
                    {order.studentName || "N/A"}
                  </TableCell>
                  <TableCell>
                    {new Date(order.date).toLocaleDateString("pt-PT")}
                  </TableCell>
                  <TableCell>
                    {order.total.toLocaleString("pt-PT", {
                      style: "currency",
                      currency: "AOA",
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="capitalize">
                                {order.status === 'pending' ? 'Pendente' : 'Concluída'}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleStatusChange(order.reference, 'pending')}>
                                Pendente
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(order.reference, 'completed')}>
                                Concluída
                            </DropdownMenuItem>
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
