
"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import type { School, Product, ReadingPlanItem, Order, Category, PaymentStatus, DeliveryStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface DataContextType {
  // Loading state
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // Schools
  schools: School[];
  setSchools: (schools: School[]) => void;
  addSchool: (school: School) => Promise<void>;
  updateSchool: (school: School) => Promise<void>;
  deleteSchool: (schoolId: string) => Promise<void>;

  // Products
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product, readingPlan: {schoolId: string, grade: number | string, status: 'mandatory' | 'recommended'}[]) => Promise<void>;
  updateProduct: (product: Product, readingPlan: {schoolId: string, grade: number | string, status: 'mandatory' | 'recommended'}[]) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;

  // Reading Plan
  readingPlan: ReadingPlanItem[];
  setReadingPlan: (readingPlan: ReadingPlanItem[]) => void;
  
  // Categories
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryName: string) => Promise<void>;

  // Publishers
  publishers: string[];
  setPublishers: (publishers: string[]) => void;
  addPublisher: (publisher: string) => Promise<void>;
  deletePublisher: (publisherName: string) => Promise<void>;

  // Orders
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Omit<Order, 'paymentStatus' | 'deliveryStatus'>) => Promise<void>;
  updateOrderPaymentStatus: (orderReference: string, status: PaymentStatus) => Promise<void>;
  updateOrderDeliveryStatus: (orderReference: string, status: DeliveryStatus) => Promise<void>;

  // Function to refetch all data
  refetchData: () => Promise<void>;
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
  
  const refetchData = useCallback(async () => {
    // This function will now be called by individual pages after they fetch their initial data
    // to update the context state.
  }, []);


  // School mutations
  const addSchool = async (school: School) => {
    setLoading(true);
    try {
      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(school),
      });
      if (!response.ok) throw new Error('Failed to add school');
      const newSchool = await response.json();
      setSchools(prev => [...prev, newSchool]);
  toast({ title: "School Added", description: `${school.name} was added successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not add school.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };
  const updateSchool = async (updatedSchool: School) => {
    setLoading(true);
    try {
        const response = await fetch(`/api/schools/${updatedSchool.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedSchool),
        });
        if (!response.ok) throw new Error('Failed to update school');
        setSchools(prev => prev.map(s => s.id === updatedSchool.id ? updatedSchool : s));
  toast({ title: "School Updated", description: `${updatedSchool.name} was updated successfully.` });
    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Could not update school.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };
  const deleteSchool = async (schoolId: string) => {
    setLoading(true);
     try {
        const response = await fetch(`/api/schools/${schoolId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete school');
        setSchools(prev => prev.filter(s => s.id !== schoolId));
        toast({ title: "School Deleted", description: `School was deleted successfully.` });
    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Could not delete school.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  // Product mutations
  const addProduct = async (product: Product, readingPlanData: {schoolId: string, grade: number | string, status: 'mandatory' | 'recommended'}[]) => {
    setLoading(true);
     try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, readingPlan: readingPlanData }),
      });
      if (!response.ok) throw new Error('Failed to add product');
      const newProduct = await response.json();
      setProducts(prev => [...prev, newProduct]);
      // Refetch reading plan as it's been modified
      const rpResponse = await fetch('/api/reading-plan');
      const updatedReadingPlan = await rpResponse.json();
      setReadingPlan(updatedReadingPlan);

      toast({ title: "Product Added", description: `${product.name.pt} was added successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not add product.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };
  const updateProduct = async (product: Product, readingPlanData: {schoolId: string, grade: number | string, status: 'mandatory' | 'recommended'}[]) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, readingPlan: readingPlanData }),
      });
      if (!response.ok) throw new Error('Failed to update product');
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      
      const rpResponse = await fetch('/api/reading-plan');
      const updatedReadingPlan = await rpResponse.json();
      setReadingPlan(updatedReadingPlan);
      
      toast({ title: "Product Updated", description: `${product.name.pt} was updated successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not update product.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };
  const deleteProduct = async (productId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      setProducts(prev => prev.filter(p => p.id !== productId));
      setReadingPlan(prev => prev.filter(rp => rp.productId !== productId));
      toast({ title: "Product Deleted", description: "Product was deleted successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not delete product.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  // Category mutations
  const addCategory = async (category: Category) => {
    setLoading(true);
     try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (!response.ok) throw new Error('Failed to add category');
      setCategories(prev => [...prev, category].sort((a,b) => a.name.localeCompare(b.name)));
      toast({ title: "Category Added", description: `${category.name} was added successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not add category.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }
  const deleteCategory = async (categoryName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/categories/${encodeURIComponent(categoryName)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete category');
      setCategories(prev => prev.filter(c => c.name !== categoryName));
      toast({ title: "Category Deleted", description: `${categoryName} was deleted successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not delete category.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }

  // Publisher mutations
  const addPublisher = async (publisher: string) => {
    setLoading(true);
      try {
      const response = await fetch('/api/publishers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: publisher }),
      });
      if (!response.ok) throw new Error('Failed to add publisher');
      setPublishers(prev => [...prev, publisher].sort());
      toast({ title: "Publisher Added", description: `${publisher} was added successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not add publisher.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }
  const deletePublisher = async (publisherName: string) => {
    setLoading(true);
      try {
      const response = await fetch(`/api/publishers/${encodeURIComponent(publisherName)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete publisher');
      setPublishers(prev => prev.filter(p => p !== publisherName));
      toast({ title: "Publisher Deleted", description: `${publisherName} was deleted successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not delete publisher.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }

  // Order mutations
  const addOrder = async (order: Omit<Order, 'paymentStatus' | 'deliveryStatus'>) => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (!response.ok) throw new Error('Failed to add order');
      const newOrder = await response.json();
      setOrders(prev => [newOrder, ...prev]);
      // No toast here, as it's handled on the checkout page
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not submit order.", variant: "destructive" });
      throw error; // Re-throw to be caught by the form handler
    } finally {
        setLoading(false);
    }
  }
  const updateOrderPaymentStatus = async (orderReference: string, status: PaymentStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderReference}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status }),
      });
      if (!response.ok) throw new Error('Failed to update payment status');
      setOrders(prev => prev.map(o => o.reference === orderReference ? { ...o, paymentStatus: status } : o));
      toast({ title: "Payment Status Updated" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not update payment status.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }
  const updateOrderDeliveryStatus = async (orderReference: string, status: DeliveryStatus) => {
    setLoading(true);
     try {
      const response = await fetch(`/api/orders/${orderReference}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryStatus: status }),
      });
      if (!response.ok) throw new Error('Failed to update delivery status');
      setOrders(prev => prev.map(o => o.reference === orderReference ? { ...o, deliveryStatus: status } : o));
      toast({ title: "Delivery Status Updated" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not update delivery status.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }

  return (
    <DataContext.Provider
      value={{
        loading,
        setLoading,
        refetchData,
        schools, setSchools, addSchool, updateSchool, deleteSchool,
        products, setProducts, addProduct, updateProduct, deleteProduct,
        readingPlan, setReadingPlan,
        categories, setCategories, addCategory, deleteCategory,
        publishers, setPublishers, addPublisher, deletePublisher,
        orders, setOrders, addOrder, updateOrderPaymentStatus, updateOrderDeliveryStatus,
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
