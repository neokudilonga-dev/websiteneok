import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const productsCol = collection(db, "products");
    const productSnapshot = await getDocs(productsCol);
    const productList = productSnapshot.docs.map((doc) => {
      const data = doc.data();
      const id = doc.id; // Get the document ID
      const { name, images, ...rest } = data; // Exclude name and images from data
      return { id, ...rest }; // Combine id with the rest of the data
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