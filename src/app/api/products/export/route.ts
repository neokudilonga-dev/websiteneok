import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getCachedProducts } from "@/lib/admin-cache";

export const dynamic = "force-static";

export async function GET() {
  try {
    const products = await getCachedProducts();
    const productList = products.map((product) => {
      const { ...rest } = product;
      return rest;
    });

    const worksheet = XLSX.utils.json_to_sheet(productList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=products.xlsx",
      },
    });
  } catch (error) {
    console.error("Error exporting products:", error);
    return NextResponse.json({ error: "Failed to export products" }, { status: 500 });
  }
}