
import { firestore } from "@/lib/firebase-admin";
import type { Order, School } from "@/lib/types";
import OrdersPageClient from "./client";

async function getOrdersData() {
    const ordersCollection = firestore.collection('orders');
    const ordersSnapshot = await ordersCollection.orderBy('date', 'desc').get();
    const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);

    const schoolsCollection = firestore.collection('schools');
    const schoolsSnapshot = await schoolsCollection.get();
    const schools = schoolsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));

    return { orders, schools };
}

export default async function OrdersPage() {
  const { orders, schools } = await getOrdersData();
  
  return (
    <OrdersPageClient 
        initialOrders={orders}
        initialSchools={schools}
    />
  )
}

export const dynamic = 'force-dynamic';
