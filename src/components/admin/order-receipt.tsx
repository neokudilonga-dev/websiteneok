
"use client";

import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BiblioAngolaLogo } from "@/components/logo";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/lib/types";
import { Download, Printer } from "lucide-react";

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
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const input = receiptRef.current;
    if (input) {
      // Temporarily make the sheet content wider for PDF generation
      const originalWidth = input.style.width;
      input.style.width = '210mm'; // A4 width

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true, 
      });

      // Restore original width
      input.style.width = originalWidth;

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      
      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        10, // top margin
        imgWidth * ratio,
        imgHeight * ratio
      );
      pdf.save(`recibo-${order.reference}.pdf`);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Recibo da Encomenda</SheetTitle>
        </SheetHeader>
        <div id="receipt-container" className="py-4">
          <div ref={receiptRef} id="receipt" className="space-y-4 p-4 border rounded-lg bg-white text-black">
            <div className="text-center">
              <BiblioAngolaLogo className="h-12 mx-auto" />
            </div>
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b">
                  <td className="font-bold p-2 border border-black">Escola</td>
                  <td className="p-2 border border-black">{order.schoolName || 'N/A'}</td>
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
        </div>
        <SheetFooter>
            <div className="flex w-full gap-2">
                 <Button onClick={handlePrint} className="w-full">
                    <Printer className="mr-2" />
                    Imprimir
                </Button>
                <Button onClick={handleDownloadPdf} className="w-full">
                    <Download className="mr-2" />
                    Download PDF
                </Button>
            </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
