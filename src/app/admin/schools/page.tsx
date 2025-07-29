
import { firestore } from "@/lib/firebase-admin";
import type { School } from "@/lib/types";
import SchoolsPageClient from "./client";

async function getSchoolsData() {
    const schoolsCollection = firestore.collection('schools');
    const schoolsSnapshot = await schoolsCollection.get();
    const schools = schoolsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
    return { schools };
}

export default async function SchoolsPage() {
  const { schools } = await getSchoolsData();
  
  return (
    <SchoolsPageClient 
        initialSchools={schools}
    />
  )
}
