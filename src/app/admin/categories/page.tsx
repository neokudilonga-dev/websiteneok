
import { firestore } from "@/lib/firebase-admin";
import type { Category } from "@/lib/types";
import CategoriesPageClient from "./client";

async function getCategoriesData() {
    const categoriesCollection = firestore.collection('categories');
    const categoriesSnapshot = await categoriesCollection.get();
    const categories = categoriesSnapshot.docs.map(doc => doc.data() as Category);
    return { categories };
}

export default async function CategoriesPage() {
  const { categories } = await getCategoriesData();
  
  return (
    <CategoriesPageClient 
        initialCategories={categories}
    />
  )
}
