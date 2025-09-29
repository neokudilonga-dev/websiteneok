
import { firestore } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/require-admin";
import type { Product, ReadingPlanItem, School } from "@/lib/types";
import BooksPageClient from "./client";

async function getAdminData() {
    const productsCollection = firestore.collection('products');
    const productsSnapshot = await productsCollection.get();
    const products = productsSnapshot.docs.map(doc => doc.data() as Product);

    const readingPlanCollection = firestore.collection('readingPlan');
    const readingPlanSnapshot = await readingPlanCollection.get();
    const readingPlan = readingPlanSnapshot.docs.map(doc => doc.data() as ReadingPlanItem);

    const schoolsCollection = firestore.collection('schools');
    const schoolsSnapshot = await schoolsCollection.get();
    const schools = schoolsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));

    const publishersCollection = firestore.collection('publishers');
    const publishersSnapshot = await publishersCollection.get();
    const publishers = publishersSnapshot.docs.map(doc => doc.id);

    return { products, readingPlan, schools, publishers };
}

export const dynamic = 'force-dynamic';

export default async function BooksPage() {
  await requireAdmin();
  const { products, readingPlan, schools, publishers } = await getAdminData();
  
  return (
    <BooksPageClient 
        initialProducts={products} 
        initialReadingPlan={readingPlan} 
        initialSchools={schools}
        initialPublishers={publishers}
    />
  )
}
