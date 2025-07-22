
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NeokudilongaLogo } from "@/components/logo";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/lib/types";

interface OrderReceiptSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  order: Order;
}

export function OrderReceiptSheet({
  isOpen,
  setIsOpen,
  order,
}: OrderReceiptSheetProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Recibo da Encomenda</SheetTitle>
        </SheetHeader>
        <div id="receipt" className="mt-4 flex flex-col space-y-4 p-4 border rounded-lg bg-white text-black">
          <div className="text-center">
            <NeokudilongaLogo className="h-12 mx-auto" />
            <p className="text-sm font-bold text-[#DAA520]">Fun Learning</p>
          </div>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr className="border-b">
                <td className="font-bold p-2 border border-black">Escola</td>
                <td className="p-2 border border-black">CAT</td>
              </tr>
              <tr className="border-b">
                <td className="font-bold p-2 border border-black">Nome do(a) Aluno(a)</td>
                <td className="p-2 border border-black">{order.studentName}</td>
              </tr>
              <tr className="border-b">
                <td className="font-bold p-2 border border-black">Nome do(a) Encarregado(a)</td>
                <td className="p-2 border border-black">{order.guardianName}</td>
              </tr>
              <tr className="border-b">
                <td className="font-bold p-2 border border-black">Número de Refêrencia</td>
                <td className="p-2 border border-black">{order.reference}</td>
              </tr>
              <tr className="border-b">
                <td className="font-bold p-2 border border-black">Número de Telefone</td>
                <td className="p-2 border border-black">{order.phone}</td>
              </tr>
              <tr className="border-b">
                <td className="font-bold p-2 border border-black">LOCAL ENTREGA:</td>
                <td className="p-2 border border-black">{order.deliveryAddress || "N/A"}</td>
              </tr>
              <tr className="border-b">
                <td className="font-bold p-2 border border-black">Forma de Pagamento</td>
                <td className="p-2 border border-black uppercase">{order.paymentMethod}</td>
              </tr>
            </tbody>
          </table>

          <table className="w-full text-sm border-collapse">
             <thead>
                <tr className="border-b">
                    <th className="font-bold p-2 border border-black text-left">ENCOMENDA:</th>
                    <th className="font-bold p-2 border border-black text-right">PREÇO:Kz</th>
                </tr>
             </thead>
             <tbody>
                {order.items.map(item => (
                    <tr key={item.id} className="border-b">
                        <td className="p-2 border border-black">{item.name}</td>
                        <td className="p-2 border border-black text-right">{item.price.toLocaleString('pt-PT')}Kz</td>
                    </tr>
                ))}
                <tr className="border-b">
                    <td className="p-2 border border-black">Entrega ao Domicílio</td>
                    <td className="p-2 border border-black text-right">{order.deliveryFee.toLocaleString('pt-PT')}Kz</td>
                </tr>
                 <tr className="border-b font-bold text-base">
                    <td className="p-2 border border-black">TOTAL</td>
                    <td className="p-2 border border-black text-right">{order.total.toLocaleString('pt-PT')}Kz</td>
                </tr>
             </tbody>
          </table>
          <p className="text-center text-xs pt-4">----------------------------------</p>
        </div>
         <Button onClick={handlePrint} className="mt-4 w-full">
            Imprimir Recibo
        </Button>
      </SheetContent>
    </Sheet>
  );
}
