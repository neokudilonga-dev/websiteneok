
import { firestore } from "@/lib/firebase-admin";
import type { Product, Order, School } from "@/lib/types";
import AdminDashboardClient from "./client-dashboard";

async function getDashboardData() {
    const productsCollection = firestore.collection('products');
    const productsSnapshot = await productsCollection.get();
    const products = productsSnapshot.docs.map(doc => doc.data() as Product);

    const ordersCollection = firestore.collection('orders');
    const ordersSnapshot = await ordersCollection.get();
    const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);

    const schoolsCollection = firestore.collection('schools');
    const schoolsSnapshot = await schoolsCollection.get();
    const schools = schoolsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));

    return { products, orders, schools };
}

export default async function AdminDashboard() {
  const { products, orders, schools } = await getDashboardData();
  
  return (
    <AdminDashboardClient 
        initialProducts={products} 
        initialOrders={orders} 
        initialSchools={schools} 
    />
  )
}

export const dynamic = 'force-dynamic';
