import { firestore } from "./firebase-admin";
import type { Product } from "./types";

export async function getProductById(id: string): Promise<Product | null> {
  if (!firestore) {
    console.error("[getProductById] Firestore not initialized");
    return null;
  }

  try {
    const docRef = firestore.collection("products").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.log(`[getProductById] Product ${id} not found`);
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
    } as Product;
  } catch (error) {
    console.error(`[getProductById] Error fetching product ${id}:`, error);
    return null;
  }
}
