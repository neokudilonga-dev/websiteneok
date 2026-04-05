import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebase-admin";
import { ProductSchema } from "@/lib/types";
import * as XLSX from 'xlsx';
import { revalidateTag } from 'next/cache';

import { getCachedCategories } from "@/lib/admin-cache";

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

    console.log("Parsed Excel data:", JSON.stringify(jsonData.slice(0, 2)));

    if (!firestore) {
      return NextResponse.json({ error: "Firestore not initialized" }, { status: 500 });
    }

    const batch = firestore.batch();
    const productsCollection = firestore.collection("products");

    const importResults: { status: string; message: string; data: any }[] = [];

    const categories = await getCachedCategories();
    const defaultBookCategory = categories.find(cat => cat.type === 'book')?.id || "";

    for (const row of jsonData) {
      try {
        let nameStr: string | undefined;
        if (typeof row.name === 'string' && row.name.trim().length > 0) {
          nameStr = String(row.name).trim();
        } else if (row.name && typeof row.name === 'object') {
          const pt = row.name.pt ?? "";
          const en = row.name.en ?? "";
          const merged = String(pt || en).trim();
          if (merged.length > 0) nameStr = merged;
        } else if (typeof row.title === 'string' && row.title.trim().length > 0) {
          nameStr = String(row.title).trim();
        }

        const descriptionStr = typeof row.description === 'string' && row.description.trim().length > 0
          ? String(row.description).trim()
          : undefined;

        let price = 0;
        if (row.price !== undefined && row.price !== null) {
          price = typeof row.price === 'string'
            ? parseFloat(String(row.price).replace(/[^\d.-]/g, ''))
            : parseFloat(String(row.price));
          if (isNaN(price)) price = 0;
        }

        let stock = 5;
        const stockSource = row.stock ?? row.unit;
        if (stockSource !== undefined && stockSource !== null) {
          stock = typeof stockSource === 'string'
            ? parseInt(String(stockSource).replace(/[^\d-]/g, ''), 10)
            : parseInt(String(stockSource), 10);
          if (isNaN(stock)) stock = 0;
        }

        let imageVal: string | string[] | undefined;
        if (row.image) {
          imageVal = row.image;
        } else if (row.images) {
          if (typeof row.images === 'string') {
            imageVal = row.images.split(',').map((img: string) => img.trim()).filter(Boolean);
          } else {
            imageVal = row.images;
          }
        } else {
          imageVal = 'https://placehold.co/600x400.png';
        }

        const categoryVal: string = (row.category && String(row.category).trim().length > 0)
          ? String(row.category).trim()
          : defaultBookCategory;

        const publisherVal: string = (row.publisher && String(row.publisher).trim().length > 0)
          ? String(row.publisher).trim()
          : (row.author && String(row.author).trim().length > 0 ? String(row.author).trim() : "");

        const typeVal: "book" | "game" = row.type === 'game' ? 'game' : 'book';
        const stockStatusVal: 'in_stock' | 'out_of_stock' | 'sold_out' = (row.stockStatus === 'out_of_stock' || row.stockStatus === 'sold_out') ? row.stockStatus : 'in_stock';

        const productData: any = {
          price,
          stock,
          type: typeVal,
          stockStatus: stockStatusVal,
        };
        if (row.id) productData.id = row.id;
        if (nameStr) productData.name = nameStr;
        if (descriptionStr) productData.description = descriptionStr;
        if (imageVal) productData.image = imageVal;
        if (categoryVal) productData.category = categoryVal;
        if (publisherVal) productData.publisher = publisherVal;
        if (row.author) productData.author = String(row.author).trim();
        if (row.dataAiHint) productData.dataAiHint = String(row.dataAiHint).trim();
        if (row.status) productData.status = String(row.status).trim();

        console.log("Processing row:", JSON.stringify(productData));

        const validation = ProductSchema.partial().safeParse(productData);

        if (!validation.success) {
          importResults.push({
            status: "failed",
            message: "Validation failed: " + validation.error.errors.map((e) => e.message).join(", "),
            data: row,
          });
          continue;
        }

        // Use a persistent ID or generate a new one
        const productId = row.id || productsCollection.doc().id;
        productData.id = productId;

        const docRef = productsCollection.doc(productId);
        batch.set(docRef, productData, { merge: true });
        importResults.push({
          status: row.id ? "updated" : "added",
          message: row.id ? "Product updated successfully" : "Product added successfully",
          data: productData
        });
      } catch (rowError) {
        console.error("Error processing row:", row, rowError);
        importResults.push({
          status: "failed",
          message: `Error processing row: ${rowError instanceof Error ? rowError.message : String(rowError)}`,
          data: row,
        });
      }
    }

    await batch.commit();

    revalidateTag('products');
    revalidateTag('shop');

    return NextResponse.json({ message: "Products imported successfully", results: importResults }, { status: 200 });
  } catch (error) {
    console.error("Error importing products:", error);
    return NextResponse.json({ 
      error: `Failed to import products: ${error instanceof Error ? error.message : String(error)}`,
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 });
  }
}
