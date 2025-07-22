
"use client";

import { useState } from "react";
import { orders as initialOrders } from "@/lib/data";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderReceiptSheet } from "@/components/admin/order-receipt";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setReceiptOpen] = useState(false);

  const viewReceipt = (order: Order) => {
    setSelectedOrder(order);
    setReceiptOpen(true);
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
                    {order.studentName}
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
                    <Badge
                      variant={
                        order.status === "pending" ? "secondary" : "default"
                      }
                      className={
                        order.status === "completed"
                          ? "bg-green-600 text-white"
                          : ""
                      }
                    >
                      {order.status === "pending"
                        ? "Pendente"
                        : "Concluída"}
                    </Badge>
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
