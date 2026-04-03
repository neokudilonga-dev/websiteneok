
import { requireAdmin } from "@/lib/require-admin";
import AdminDashboardClient from "./client-dashboard";
import { getCachedProducts, getCachedOrders, getCachedSchools } from "@/lib/admin-cache";

async function getDashboardData() {
    console.log('[AdminDashboard] Fetching dashboard data...');
    const [products, orders, schools] = await Promise.all([
        getCachedProducts(),
        getCachedOrders(),
        getCachedSchools()
    ]);
    console.log(`[AdminDashboard] Data fetched: ${products.length} products, ${orders.length} orders, ${schools.length} schools`);
    return { products, orders, schools };
}

export default async function AdminDashboard() {
  // Enforce server-side admin guard
  await requireAdmin();
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
