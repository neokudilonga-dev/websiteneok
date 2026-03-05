
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
import { NeokudilongaLogo } from "@/components/logo";
import type { Order } from "@/lib/types";
import { Download, Printer } from "lucide-react";
import { getDisplayName } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

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
  const { t, language } = useLanguage();

  const paymentMethodLabel = () => {
    if (order.paymentMethod === 'transferencia') return t('checkout_form.payment_method_3');
    if (order.paymentMethod === 'multicaixa') return t('checkout_form.payment_method_2');
    if (order.paymentMethod === 'numerario') return t('checkout_form.payment_method_1');
    return order.paymentMethod;
  };
  const preferredTimeLabel = () => {
    const v = order.preferredDeliveryTime;
    if (!v) return '';
    if (v === 'morning') return t('checkout_form.preferred_delivery_time_options.morning');
    if (v === 'afternoon') return t('checkout_form.preferred_delivery_time_options.afternoon');
    if (v === 'evening') return t('checkout_form.preferred_delivery_time_options.evening');
    return String(v);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Recibo</title>');
      printWindow.document.write('<style>@media print { body { -webkit-print-color-adjust: exact; } table { border-collapse: collapse; width: 100%;} td, th { border: 1px solid black; padding: 8px; } }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(receiptRef.current?.innerHTML || '');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
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
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t('orders_page.view_receipt')}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-auto">
          <div id="receipt-container" className="py-4 pr-6 overflow-x-auto">
            <div ref={receiptRef} id="receipt" className="space-y-4 p-4 border rounded-lg bg-white text-black min-w-[210mm]">
              <div className="text-center">
                <NeokudilongaLogo className="h-12 mx-auto" />
              </div>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b">
                    <td className="font-bold p-2 border border-black">{t('receipt.school')}</td>
                    <td className="p-2 border border-black">{order.schoolName || 'N/A'}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-bold p-2 border border-black">{t('receipt.student_name')}</td>
                    <td className="p-2 border border-black">{order.studentName}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-bold p-2 border border-black">{t('receipt.guardian_name')}</td>
                    <td className="p-2 border border-black">{order.guardianName}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-bold p-2 border border-black">{t('receipt.reference')}</td>
                    <td className="p-2 border border-black">{order.reference}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-bold p-2 border border-black">{t('receipt.phone')}</td>
                    <td className="p-2 border border-black">{order.phone}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-bold p-2 border border-black">{t('receipt.delivery_address')}</td>
                    <td className="p-2 border border-black">{order.deliveryAddress || "N/A"}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="font-bold p-2 border border-black">{t('receipt.payment_method')}</td>
                    <td className="p-2 border border-black">{paymentMethodLabel()}</td>
                  </tr>
              {order.preferredDeliveryTime && (
                <tr className="border-b">
                  <td className="font-bold p-2 border border-black">{t('checkout_form.preferred_delivery_time')}</td>
                  <td className="p-2 border border-black">{preferredTimeLabel()}</td>
                </tr>
              )}
                </tbody>
              </table>

              <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="border-b">
                        <th className="font-bold p-2 border border-black text-left">{t('receipt.order')}:</th>
                        <th className="font-bold p-2 border border-black text-right">{t('receipt.price_kz')}</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map(item => (
                        <tr key={item.id} className="border-b">
                            <td className="p-2 border border-black">{getDisplayName(item.name, language)}</td>
                            <td className="p-2 border border-black text-right">{item.price.toLocaleString('pt-PT')}Kz</td>
                        </tr>
                    ))}
                    <tr className="border-b">
                        <td className="p-2 border border-black">{t('receipt.home_delivery')}</td>
                        <td className="p-2 border border-black text-right">{order.deliveryFee.toLocaleString('pt-PT')}Kz</td>
                    </tr>
                    <tr className="border-b font-bold text-base">
                        <td className="p-2 border border-black">{t('receipt.total')}</td>
                        <td className="p-2 border border-black text-right">{order.total.toLocaleString('pt-PT')}Kz</td>
                    </tr>
                </tbody>
              </table>
              <p className="text-center text-xs pt-4">----------------------------------</p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="text-left">
                  <div className="h-8 border-b border-black w-full"></div>
                  <p className="mt-1 text-xs">{t('receipt.signature')}</p>
                </div>
                <div className="text-left">
                  <div className="h-8 border-b border-black w-full"></div>
                  <p className="mt-1 text-xs">{t('receipt.date_line')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <SheetFooter className="mt-auto pt-4">
            <div className="flex w-full gap-2">
                 <Button onClick={handlePrint} className="w-full">
                    <Printer className="mr-2" />
                    {t('receipt.print')}
                </Button>
                <Button onClick={handleDownloadPdf} className="w-full">
                    <Download className="mr-2" />
                    {t('receipt.download_pdf')}
                </Button>
            </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
