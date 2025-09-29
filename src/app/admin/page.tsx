
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
  try {
    const { products, orders, schools } = await getDashboardData();
    return (
      <AdminDashboardClient 
          initialProducts={products} 
          initialOrders={orders} 
          initialSchools={schools} 
      />
    );
  } catch (error: any) {
    console.error('[AdminDashboard] Server component render error:', error);
    const msg = error?.message || String(error);
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold text-red-600">Admin data load failed</h2>
        <p className="mt-2 text-sm">There was an error while loading admin data on the server.</p>
        <pre className="mt-3 whitespace-pre-wrap break-words rounded bg-muted p-3 text-xs">{msg}</pre>
      </div>
    );
  }
}

export const dynamic = 'force-dynamic';
