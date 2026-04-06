import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getCachedProducts } from "@/lib/admin-cache";

export const dynamic = "force-static";

export async function GET() {
  try {
    const products = await getCachedProducts();
    const gameList = products
      .filter(p => p.type === 'game')
      .map((product) => {
        const { image, ...rest } = product;
        return rest;
      });

    const worksheet = XLSX.utils.json_to_sheet(gameList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Games");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=games.xlsx",
      },
    });
  } catch (error) {
    console.error("Error exporting games:", error);
    return NextResponse.json({ error: "Failed to export games" }, { status: 500 });
  }
}
