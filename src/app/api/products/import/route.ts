import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { ProductSchema } from "@/lib/types";
import { collection, doc, writeBatch } from "firebase/firestore";
import * as XLSX from 'xlsx';

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

    const batch = writeBatch(db);
    const productsCollection = collection(db, "products");

    const importResults: { status: string; message: string; data: any }[] = [];

    for (const row of jsonData) {
      try {
        // Handle multilingual name field
        let name;
        if (row.name) {
          // Check if name is already an object or needs to be created
          name = typeof row.name === 'string' 
            ? { pt: row.name, en: row.name } 
            : row.name;
        } else {
          name = { pt: "", en: "" };
        }

        // Handle description field
        const description = row.description || "";
        
        // Handle price field - ensure it's a number
        let price = 0;
        if (row.price !== undefined && row.price !== null) {
          price = typeof row.price === 'string' 
            ? parseFloat(row.price.replace(/[^\d.-]/g, '')) 
            : parseFloat(row.price);
          
          if (isNaN(price)) price = 0;
        }

        // Handle stock field - ensure it's a number
        let stock = 0;
        if (row.stock !== undefined && row.stock !== null) {
          stock = typeof row.stock === 'string' 
            ? parseInt(row.stock.replace(/[^\d]/g, '')) 
            : parseInt(row.stock);
          
          if (isNaN(stock)) stock = 0;
        }

        // Handle image field
        let image;
        if (row.image) {
          image = row.image;
        } else if (row.images) {
          // Handle comma-separated images
          if (typeof row.images === 'string') {
            image = row.images.split(',').map(img => img.trim());
          } else {
            image = row.images;
          }
        }

        // Create product data with proper structure
        const productData = {
          id: row.id,
          name: name,
          description: description,
          price: price,
          stock: stock,
          category: row.category || "",
          publisher: row.publisher || "",
          type: row.type || "book",
          stockStatus: row.stockStatus || "in_stock",
          image: image
        };

        console.log("Processing row:", JSON.stringify(productData));

        // Use partial schema to allow for missing fields
        const validation = ProductSchema.partial().safeParse(productData);

        if (!validation.success) {
          importResults.push({
            status: "failed",
            message: "Validation failed: " + validation.error.errors.map((e) => e.message).join(", "),
            data: row,
          });
          continue;
        }

        if (row.id) {
          // Update existing product if ID is provided
          const productRef = doc(db, "products", row.id);
          batch.update(productRef, productData);
          importResults.push({ status: "updated", message: "Product updated successfully", data: productData });
        } else {
          // Add new product if no ID is provided
          const productRef = doc(productsCollection);
          batch.set(productRef, productData);
          importResults.push({ status: "added", message: "Product added successfully", data: productData });
        }
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
    return NextResponse.json({ message: "Products imported successfully", results: importResults }, { status: 200 });
  } catch (error) {
    console.error("Error importing products:", error);
    return NextResponse.json({ 
      error: `Failed to import products: ${error instanceof Error ? error.message : String(error)}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}