
import { firestore } from "@/lib/firebase-admin";
import type { Product } from "@/lib/types";
import GamesPageClient from "./client";

async function getGamesData() {
    const productsCollection = firestore.collection('products');
    const productsSnapshot = await productsCollection.get();
    const products = productsSnapshot.docs.map(doc => doc.data() as Product);
    return { products };
}

export default async function GamesPage() {
  const { products } = await getGamesData();
  
  return (
    <GamesPageClient 
        initialProducts={products} 
    />
  )
}
