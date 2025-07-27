
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import type { School, Product, ReadingPlanItem, Order, Category, PaymentStatus, DeliveryStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface DataContextType {
  // Loading state
  loading: boolean;

  // Schools
  schools: School[];
  addSchool: (school: School) => Promise<void>;
  updateSchool: (school: School) => Promise<void>;
  deleteSchool: (schoolId: string) => Promise<void>;

  // Products
  products: Product[];
  addProduct: (product: Product, readingPlan: {schoolId: string, grade: number | string, status: 'mandatory' | 'recommended'}[]) => Promise<void>;
  updateProduct: (product: Product, readingPlan: {schoolId: string, grade: number | string, status: 'mandatory' | 'recommended'}[]) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;

  // Reading Plan
  readingPlan: ReadingPlanItem[];
  
  // Categories
  categories: Category[];
  addCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryName: string) => Promise<void>;

  // Publishers
  publishers: string[];
  addPublisher: (publisher: string) => Promise<void>;
  deletePublisher: (publisherName: string) => Promise<void>;

  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'paymentStatus' | 'deliveryStatus'>) => Promise<void>;
  updateOrderPaymentStatus: (orderReference: string, status: PaymentStatus) => Promise<void>;
  updateOrderDeliveryStatus: (orderReference: string, status: DeliveryStatus) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [readingPlan, setReadingPlan] = useState<ReadingPlanItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        schoolsRes, 
        productsRes, 
        readingPlanRes, 
        categoriesRes, 
        publishersRes, 
        ordersRes
      ] = await Promise.all([
        fetch('/api/schools'),
        fetch('/api/products'),
        fetch('/api/reading-plan'),
        fetch('/api/categories'),
        fetch('/api/publishers'),
        fetch('/api/orders'),
      ]);

      if (!schoolsRes.ok) throw new Error('Failed to fetch schools');
      if (!productsRes.ok) throw new Error('Failed to fetch products');
      if (!readingPlanRes.ok) throw new Error('Failed to fetch reading plan');
      if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
      if (!publishersRes.ok) throw new Error('Failed to fetch publishers');
      if (!ordersRes.ok) throw new Error('Failed to fetch orders');

      setSchools(await schoolsRes.json());
      setProducts(await productsRes.json());
      setReadingPlan(await readingPlanRes.json());
      setCategories(await categoriesRes.json());
      setPublishers(await publishersRes.json());
      setOrders(await ordersRes.json());

    } catch (error) {
      console.error("Failed to fetch initial data", error);
      toast({
          title: "Error fetching data",
          description: "Could not load data from the database. Please try refreshing.",
          variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // School mutations
  const addSchool = async (school: School) => {
    try {
      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(school),
      });
      if (!response.ok) throw new Error('Failed to add school');
      await fetchData(); // Refetch all data
      toast({ title: "School Added", description: `${school.name.pt} was added successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not add school.", variant: "destructive" });
    }
  };
  const updateSchool = async (updatedSchool: School) => {
    try {
        const response = await fetch(`/api/schools/${updatedSchool.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedSchool),
        });
        if (!response.ok) throw new Error('Failed to update school');
        await fetchData(); // Refetch all data
        toast({ title: "School Updated", description: `${updatedSchool.name.pt} was updated successfully.` });
    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Could not update school.", variant: "destructive" });
    }
  };
  const deleteSchool = async (schoolId: string) => {
     try {
        const response = await fetch(`/api/schools/${schoolId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete school');
        await fetchData(); // Refetch all data
        toast({ title: "School Deleted", description: `School was deleted successfully.` });
    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Could not delete school.", variant: "destructive" });
    }
  };

  // Product mutations
  const addProduct = async (product: Product, readingPlan: {schoolId: string, grade: number | string, status: 'mandatory' | 'recommended'}[]) => {
     try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, readingPlan }),
      });
      if (!response.ok) throw new Error('Failed to add product');
      await fetchData(); // Refetch all data
      toast({ title: "Product Added", description: `${product.name.pt} was added successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not add product.", variant: "destructive" });
    }
  };
  const updateProduct = async (product: Product, readingPlan: {schoolId: string, grade: number | string, status: 'mandatory' | 'recommended'}[]) => {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, readingPlan }),
      });
      if (!response.ok) throw new Error('Failed to update product');
      await fetchData(); // Refetch all data
      toast({ title: "Product Updated", description: `${product.name.pt} was updated successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not update product.", variant: "destructive" });
    }
  };
  const deleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      await fetchData(); // Refetch all data
      toast({ title: "Product Deleted", description: "Product was deleted successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not delete product.", variant: "destructive" });
    }
  };

  // Category mutations
  const addCategory = async (category: Category) => {
     try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (!response.ok) throw new Error('Failed to add category');
      await fetchData();
      toast({ title: "Category Added", description: `${category.name} was added successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not add category.", variant: "destructive" });
    }
  }
  const deleteCategory = async (categoryName: string) => {
    try {
      const response = await fetch(`/api/categories/${encodeURIComponent(categoryName)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete category');
      await fetchData();
      toast({ title: "Category Deleted", description: `${categoryName} was deleted successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not delete category.", variant: "destructive" });
    }
  }

  // Publisher mutations
  const addPublisher = async (publisher: string) => {
      try {
      const response = await fetch('/api/publishers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: publisher }),
      });
      if (!response.ok) throw new Error('Failed to add publisher');
      await fetchData();
      toast({ title: "Publisher Added", description: `${publisher} was added successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not add publisher.", variant: "destructive" });
    }
  }
  const deletePublisher = async (publisherName: string) => {
      try {
      const response = await fetch(`/api/publishers/${encodeURIComponent(publisherName)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete publisher');
      await fetchData();
      toast({ title: "Publisher Deleted", description: `${publisherName} was deleted successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not delete publisher.", variant: "destructive" });
    }
  }

  // Order mutations
  const addOrder = async (order: Omit<Order, 'paymentStatus' | 'deliveryStatus'>) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (!response.ok) throw new Error('Failed to add order');
      await fetchData();
      // No toast here, as it's handled on the checkout page
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not submit order.", variant: "destructive" });
      throw error; // Re-throw to be caught by the form handler
    }
  }
  const updateOrderPaymentStatus = async (orderReference: string, status: PaymentStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderReference}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status }),
      });
      if (!response.ok) throw new Error('Failed to update payment status');
      await fetchData();
      toast({ title: "Payment Status Updated" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not update payment status.", variant: "destructive" });
    }
  }
  const updateOrderDeliveryStatus = async (orderReference: string, status: DeliveryStatus) => {
     try {
      const response = await fetch(`/api/orders/${orderReference}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryStatus: status }),
      });
      if (!response.ok) throw new Error('Failed to update delivery status');
      await fetchData();
      toast({ title: "Delivery Status Updated" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not update delivery status.", variant: "destructive" });
    }
  }

  return (
    <DataContext.Provider
      value={{
        loading,
        schools, addSchool, updateSchool, deleteSchool,
        products, addProduct, updateProduct, deleteProduct,
        readingPlan,
        categories, addCategory, deleteCategory,
        publishers, addPublisher, deletePublisher,
        orders, addOrder, updateOrderPaymentStatus, updateOrderDeliveryStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
