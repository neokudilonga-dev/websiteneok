
import { firestore } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/require-admin";
import type { Category } from "@/lib/types";
import CategoriesPageClient from "./client";

async function getCategoriesData() {
    const categoriesCollection = firestore.collection('categories');
    const categoriesSnapshot = await categoriesCollection.get();
    const categories = categoriesSnapshot.docs.map(doc => doc.data() as Category);
    return { categories };
}

export default async function CategoriesPage() {
  await requireAdmin();
  const { categories } = await getCategoriesData();
  
  return (
    <CategoriesPageClient 
        initialCategories={categories}
    />
  )
}

export const dynamic = 'force-dynamic';
