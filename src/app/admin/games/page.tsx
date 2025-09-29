
import { firestore } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/require-admin";
import type { Product } from "@/lib/types";
import GamesPageClient from "./client";
import type { School } from "@/lib/types";

async function getGamesData() {
    const productsCollection = firestore.collection('products');
    const productsSnapshot = await productsCollection.get();
    const products = productsSnapshot.docs.map(doc => doc.data() as Product);

    const schoolsCollection = firestore.collection('schools');
    const schoolsSnapshot = await schoolsCollection.get();
    const schools = schoolsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as School[];

    return { products, schools };
}

export default async function GamesPage() {
  await requireAdmin();
  const { products, schools } = await getGamesData();
  
  return (
    <GamesPageClient 
        initialProducts={products} 
        initialSchools={schools}
    />
  )
}

export const dynamic = 'force-dynamic';
