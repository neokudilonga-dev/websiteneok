
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { School, Product, ReadingPlanItem, Order, Category, PaymentStatus, DeliveryStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "./language-context";
import { cache } from "@/lib/cache";

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
  saveSchoolOrder: (orderedSchools: School[]) => Promise<void>;

  // Products
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product, readingPlan: ReadingPlanItem[]) => Promise<Product>;
  updateProduct: (id: string, product: Product) => Promise<void>;
  deleteProduct: (productId: string, imageUrl?: string) => Promise<void>;

  // Reading Plan
  readingPlan: ReadingPlanItem[];
  setReadingPlan: (readingPlan: ReadingPlanItem[]) => void;
  
  // Categories
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (prevId: string, next: Category) => Promise<void>;
  deleteCategory: (categoryName: { pt: string; en: string } | string) => Promise<void>;

  // Publishers
  publishers: string[];
  setPublishers: (publishers: string[]) => void;
  addPublisher: (publisher: string) => Promise<void>;
  updatePublisher: (prevName: string, nextName: string) => Promise<void>;
  deletePublisher: (publisherName: string) => Promise<void>;

  // Orders
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  submitOrder: (order: Omit<Order, 'paymentStatus' | 'deliveryStatus'>) => Promise<void>;
  addOrder: (order: Omit<Order, 'paymentStatus' | 'deliveryStatus'>) => Promise<void>;
  updateOrderPaymentStatus: (orderReference: string, status: PaymentStatus) => Promise<void>;
  updateOrderDeliveryStatus: (orderReference: string, status: DeliveryStatus) => Promise<void>;
  updateOrderDeliveryDate: (orderReference: string, date: string) => Promise<void>;
  deleteOrder: (orderReference: string) => Promise<void>;


}

export const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
  initialSchools?: School[];
  initialProducts?: Product[];
  initialReadingPlan?: ReadingPlanItem[];
  initialCategories?: Category[];
  initialOrders?: Order[];
  initialPublishers?: string[];
}

export const DataProvider = ({
  children,
  initialSchools,
  initialProducts,
  initialReadingPlan,
  initialCategories,
  initialOrders,
  initialPublishers,
}: DataProviderProps) => {
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>(initialSchools ?? []);
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [readingPlan, setReadingPlan] = useState<ReadingPlanItem[]>(initialReadingPlan ?? []);
  const [categories, setCategories] = useState<Category[]>(initialCategories ?? []);
  const { language } = useLanguage();
  const [publishers, setPublishers] = useState<string[]>(initialPublishers ?? []);
  const [orders, setOrders] = useState<Order[]>(initialOrders ?? []);
  const { toast } = useToast();

  // Inicializar dados do cache se não houver dados iniciais (SSR)
  useEffect(() => {
    if (!initialSchools?.length) {
      const cachedSchools = cache.get<School[]>('schools');
      if (cachedSchools) setSchools(cachedSchools);
    }
    if (!initialProducts?.length) {
      const cachedProducts = cache.get<Product[]>('products');
      if (cachedProducts) setProducts(cachedProducts);
    }
    if (!initialCategories?.length) {
      const cachedCategories = cache.get<Category[]>('categories');
      if (cachedCategories) setCategories(cachedCategories);
    }
    if (!initialReadingPlan?.length) {
      const cachedRP = cache.get<ReadingPlanItem[]>('reading-plan');
      if (cachedRP) setReadingPlan(cachedRP);
    }
    if (!initialOrders?.length) {
      const cachedOrders = cache.get<Order[]>('orders');
      if (cachedOrders) setOrders(cachedOrders);
    }
    if (!initialPublishers?.length) {
      const cachedPublishers = cache.get<string[]>('publishers');
      if (cachedPublishers) setPublishers(cachedPublishers);
    }
  }, [initialSchools?.length, initialProducts?.length, initialCategories?.length, initialReadingPlan?.length, initialOrders?.length, initialPublishers?.length]);

  // Sincronizar estado com cache quando os dados mudam
  useEffect(() => {
    if (schools.length) cache.set('schools', schools);
  }, [schools]);

  useEffect(() => {
    if (products.length) cache.set('products', products);
  }, [products]);

  useEffect(() => {
    if (categories.length) cache.set('categories', categories);
  }, [categories]);

  useEffect(() => {
    if (readingPlan.length) cache.set('reading-plan', readingPlan);
  }, [readingPlan]);

  useEffect(() => {
    if (orders.length) cache.set('orders', orders);
  }, [orders]);

  useEffect(() => {
    if (publishers.length) cache.set('publishers', publishers);
  }, [publishers]);

  // Order mutations
  const submitOrder = async (order: Omit<Order, 'paymentStatus' | 'deliveryStatus'>) => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (!response.ok) throw new Error('Failed to submit order');
      
      const newOrder: Order = {
        ...order,
        paymentStatus: 'unpaid',
        deliveryStatus: 'not_delivered',
        createdAt: new Date().toISOString()
      };
      setOrders(prev => [newOrder, ...prev]);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

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
      
      const { id } = await response.json();
      const newSchool = { ...school, id };
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

  const saveSchoolOrder = async (orderedSchools: School[]) => {
    setLoading(true);
    try {
      const response = await fetch('/api/schools/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schools: orderedSchools.map((s, index) => ({ id: s.id, order: index })) }),
      });
      if (!response.ok) throw new Error('Failed to save school order');
      
      setSchools(orderedSchools.map((s, index) => ({ ...s, order: index })));
      toast({ title: "School Order Saved" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not save school order.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

   // Product mutations
  const addProduct = async (product: Product, readingPlanData: ReadingPlanItem[]) => {
    setLoading(true);
     try {
      console.log("Adding product...", product);
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, readingPlan: readingPlanData }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Add Product API Error:', errorData);
        throw new Error(errorData.message || 'Failed to add product');
      }

       const { productId } = await response.json();
       const newProduct = { ...product, id: productId };

       // Atualização otimista do estado local para evitar refetch total
       setProducts(prev => [...prev, newProduct]);
       
       if (readingPlanData.length > 0) {
         const newRPItems: ReadingPlanItem[] = readingPlanData.map(rp => ({
           id: `${productId}_${rp.schoolId}_${rp.grade}`,
           productId,
           schoolId: rp.schoolId,
           grade: Number(rp.grade),
           status: rp.status
         }));
         setReadingPlan(prev => [...prev, ...newRPItems]);
       }
 
       toast({
         title: "Product Added",
         description:
           typeof product.name === 'string'
             ? `${product.name} was added successfully.`
             : `${product.name?.pt || product.name?.en} was added successfully.`
       });
       return newProduct;
     } catch (error) {
       console.error('Add product failed:', error);
       toast({ 
         title: "Error", 
         description: (error as Error).message || "Could not add product.", 
         variant: "destructive" 
       });
       throw error;
     } finally {
         setLoading(false);
     }
   };
   const updateProduct = async (id: string, product: Product) => {
     setLoading(true);
     try {
       console.log(`Updating product ${id}...`, product);
       const response = await fetch(`/api/products/${id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ product }),
       });
       
       if (!response.ok) {
         const errorData = await response.json().catch(() => ({}));
         console.error('Update API Error:', errorData);
         throw new Error(errorData.error || errorData.message || `Failed to update product (${response.status})`);
       }

       // Atualização local do estado
       setProducts(prev => prev.map(p => p.id === id ? { ...product, id } : p));
       
       if (product.readingPlan) {
         setReadingPlan(prev => {
           // Remove existing RP items for this product
           const otherRP = prev.filter(rp => rp.productId !== id);
           // Add new ones
           return [...otherRP, ...product.readingPlan!];
         });
       }
       
       toast({
         title: "Product Updated",
         description:
           typeof product.name === 'string'
             ? `${product.name} was updated successfully.`
             : `${product.name?.pt || product.name?.en} was updated successfully.`
       });
     } catch (error) {
       console.error('Update product failed:', error);
       toast({ 
         title: "Error", 
         description: (error as Error).message || "Could not update product.", 
         variant: "destructive" 
       });
       throw error;
     } finally {
         setLoading(false);
     }
   };
  const deleteProduct = async (productId: string, imageUrl?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });
      if (!response.ok) throw new Error('Failed to delete product');
      
      // Atualização local do estado
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
      
      setCategories(prev => [...prev, category]);
      toast({ title: "Category Added", description: `${category.name[language]} was added successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not add category.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  const updateCategory = async (prevId: string, next: Category) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/categories/${encodeURIComponent(prevId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: next.name, type: next.type }),
      });
      if (!response.ok) throw new Error('Failed to update category');
      
      setCategories(prev => prev.map(c => {
        const matchById = c.id && prevId && c.id === prevId;
        const matchByName = !c.id && (c.name?.pt === prevId || c.name?.en === prevId);
        if (matchById || matchByName) return { ...next };
        return c;
      }));
      
      toast({ title: "Category Updated", description: `${next.name[language]} was updated successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not update category.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  const deleteCategory = async (categoryName: { pt: string; en: string } | string) => {
    setLoading(true);
    try {
      let nameToDelete: string;
      if (typeof categoryName === 'object' && categoryName !== null) {
        nameToDelete = categoryName.pt || categoryName.en;
      } else {
        nameToDelete = categoryName;
      }
      const response = await fetch(`/api/categories/${encodeURIComponent(nameToDelete)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete category');
      
      setCategories(prev => prev.filter(c => {
        const cName = typeof c.name === 'string' ? c.name : (c.name?.pt || c.name?.en);
        return cName !== nameToDelete;
      }));
      
      toast({ title: "Category Deleted", description: `${nameToDelete} was deleted successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not delete category.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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
      
      setPublishers(prev => [...prev, publisher]);
      toast({ title: "Publisher Added", description: `${publisher} was added successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not add publisher.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }
  const updatePublisher = async (prevName: string, nextName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/publishers/${encodeURIComponent(prevName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nextName }),
      });
      if (!response.ok) throw new Error('Failed to update publisher');
      
      setPublishers(prev => prev.map(p => p === prevName ? nextName : p));
      toast({ title: "Publisher Updated", description: `${nextName} was updated successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not update publisher.", variant: "destructive" });
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
      
     const newOrder: Order = {
         ...order,
         paymentStatus: 'unpaid',
         deliveryStatus: 'not_delivered'
       };
      setOrders(prev => [newOrder, ...prev]);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not submit order.", variant: "destructive" });
      throw error;
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

  const updateOrderDeliveryDate = async (orderReference: string, date: string) => {
    setLoading(true);
     try {
      const response = await fetch(`/api/orders/${orderReference}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryDate: date }),
      });
      if (!response.ok) throw new Error('Failed to update delivery date');
      
      setOrders(prev => prev.map(o => o.reference === orderReference ? { ...o, deliveryDate: date } : o));
      toast({ title: "Delivery Date Updated" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not update delivery date.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }
  const deleteOrder = async (orderReference: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderReference}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete order');
      
      setOrders(prev => prev.filter(o => o.reference !== orderReference));
      toast({ title: "Order Deleted", description: `Order ${orderReference} was deleted successfully.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not delete order.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <DataContext.Provider
      value={{
        loading,
        setLoading,

        schools, setSchools, addSchool, updateSchool, deleteSchool, saveSchoolOrder,
        products, setProducts, addProduct, updateProduct, deleteProduct,
        readingPlan, setReadingPlan,
        categories, setCategories, addCategory, updateCategory, deleteCategory,
        publishers, setPublishers, addPublisher, updatePublisher, deletePublisher,
        orders, setOrders, submitOrder, addOrder, updateOrderPaymentStatus, updateOrderDeliveryStatus, updateOrderDeliveryDate, deleteOrder,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// Simple hook for just the loading state (for global overlay)
export const useGlobalLoading = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useGlobalLoading must be used within a DataProvider");
  return context.loading;
};

// Export useData hook for context consumers
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

