
"use server";

import Header from "@/components/header";
import { firestore } from "@/lib/firebase-admin";
import type { School, ReadingPlanItem } from "@/lib/types";
import CheckoutClient from "./client";

async function getCheckoutData() {
    const schoolsCollection = firestore.collection('schools');
    const schoolsSnapshot = await schoolsCollection.get();
    const schools = schoolsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));

    const readingPlanCollection = firestore.collection('readingPlan');
    const readingPlanSnapshot = await readingPlanCollection.get();
    const readingPlan = readingPlanSnapshot.docs.map(doc => doc.data() as ReadingPlanItem);

    return { schools, readingPlan };
}

export default async function CheckoutPage() {
  const { schools, readingPlan } = await getCheckoutData();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <CheckoutClient schools={schools} readingPlan={readingPlan} />
    </div>
  );
}
