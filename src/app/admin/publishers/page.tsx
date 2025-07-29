
import { firestore } from "@/lib/firebase-admin";
import PublishersPageClient from "./client";

async function getPublishersData() {
    const publishersCollection = firestore.collection('publishers');
    const publishersSnapshot = await publishersCollection.get();
    const publishers = publishersSnapshot.docs.map(doc => doc.id).sort();
    return { publishers };
}

export default async function PublishersPage() {
  const { publishers } = await getPublishersData();
  
  return (
    <PublishersPageClient 
        initialPublishers={publishers}
    />
  )
}
