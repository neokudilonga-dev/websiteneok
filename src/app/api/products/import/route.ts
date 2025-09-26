import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { ProductSchema } from "@/lib/types";
import { collection, doc, writeBatch, query, where, getDocs } from "firebase/firestore";
import * as XLSX from 'xlsx'; // Import the xlsx library

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

    const batch = writeBatch(db);
    const productsCollection = collection(db, "products");

    const importResults: { status: string; message: string; data: any }[] = [];

    for (const row of jsonData) {
      const productData = {
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        stock: parseInt(row.stock),
        category: row.category,
        publisher: row.publisher,
        images: row.images ? row.images.split(',') : [],
        // Add other fields as necessary
      };

      const validation = ProductSchema.partial().safeParse(productData);

      if (!validation.success) {
        importResults.push({
          status: "failed",
          message: "Validation failed: " + validation.error.errors.map((e) => e.message).join(", "),
          data: row,
        });
        continue;
      }

      const existingProductQuery = query(productsCollection, where("name", "==", productData.name));
      const existingProductSnapshot = await getDocs(existingProductQuery);

      if (!existingProductSnapshot.empty) {
        // Update existing product
        const productId = existingProductSnapshot.docs[0].id;
        const productRef = doc(db, "products", productId);
        batch.update(productRef, validation.data);
        importResults.push({ status: "updated", message: "Product updated successfully", data: productData });
      } else {
        // Add new product
        const productRef = doc(productsCollection);
        batch.set(productRef, validation.data);
        importResults.push({ status: "added", message: "Product added successfully", data: productData });
      }
    }

    await batch.commit();
    return NextResponse.json({ message: "Products imported successfully", results: importResults }, { status: 200 });
  } catch (error) {
    console.error("Error importing products:", error);
    return NextResponse.json({ error: "Failed to import products." }, { status: 500 });
  }
}