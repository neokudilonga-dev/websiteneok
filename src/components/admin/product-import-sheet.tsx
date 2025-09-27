"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import Spinner from "@/components/ui/spinner";

interface ProductImportSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductImportSheet({ isOpen, onClose, onSuccess }: ProductImportSheetProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [_results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    if (selectedFile) {
      if (selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an Excel file (.xlsx).",
          variant: "destructive",
        });
        setFile(null);
      }
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file to upload.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResults([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Import successful",
          description: data.message,
        });
        onSuccess();
      } else {
        toast({
          title: "Import failed",
          description: data.message || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/products/export");
      if (!response.ok) {
        throw new Error("Export failed");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "products.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Export successful",
        description: "Products exported to products.xlsx",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Failed to export products.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Import Products</SheetTitle>
          <SheetDescription>
            Upload an Excel file to bulk add or update products.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">
              Excel File
            </Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
            />
          </div>
          <Button onClick={handleUpload} disabled={!file || loading}>
            {loading ? <Spinner className="mr-2" /> : null}
            Upload Excel File
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="w-full"
            disabled={isExporting}
          >
            {isExporting ? "Exporting..." : "Export Products"}
          </Button>

          <SheetClose asChild>
            <Button type="submit" className="w-full">
              Done
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}