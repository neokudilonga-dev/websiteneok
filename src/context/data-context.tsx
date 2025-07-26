
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { School, Product, ReadingPlanItem, Order, Category } from "@/lib/types";
import { 
    products as initialProducts, 
    readingPlan as initialReadingPlan, 
    allCategories as initialCategories,
    publishers as initialPublishers,
    orders as initialOrders
} from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

interface DataContextType {
  // Schools
  schools: School[];
  addSchool: (school: School) => Promise<void>;
  updateSchool: (school: School) => Promise<void>;
  deleteSchool: (schoolId: string) => Promise<void>;
  loadingSchools: boolean;

  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;

  // Reading Plan
  readingPlan: ReadingPlanItem[];
  updateReadingPlanForProduct: (productId: string, newPlan: {schoolId: string, grade: number | string, status: 'mandatory' | 'recommended'}[]) => void;
  
  // Categories
  categories: Category[];
  addCategory: (category: Category) => void;
  deleteCategory: (categoryName: string) => void;

  // Publishers
  publishers: string[];
  addPublisher: (publisher: string) => void;
  deletePublisher: (publisherName: string) => void;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderPaymentStatus: (orderReference: string, status: Order['paymentStatus']) => void;
  updateOrderDeliveryStatus: (orderReference: string, status: Order['deliveryStatus']) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [readingPlan, setReadingPlan] = useState<ReadingPlanItem[]>(initialReadingPlan);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [publishers, setPublishers] = useState<string[]>(initialPublishers);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoadingSchools(true);
        const response = await fetch('/api/schools');
        if (!response.ok) {
          throw new Error('Failed to fetch schools');
        }
        const data = await response.json();
        setSchools(data);
      } catch (error) {
        console.error(error);
        toast({
            title: "Error fetching schools",
            description: "Could not load school data from the database.",
            variant: "destructive"
        })
      } finally {
        setLoadingSchools(false);
      }
    };

    fetchSchools();
  }, [toast]);

  // School mutations
  const addSchool = async (school: School) => {
    try {
      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(school),
      });
      if (!response.ok) throw new Error('Failed to add school');
      const newSchool = await response.json();
      setSchools(prev => [...prev, newSchool]);
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
        const savedSchool = await response.json();
        setSchools(prev => prev.map(s => s.id === savedSchool.id ? savedSchool : s));
        toast({ title: "School Updated", description: `${savedSchool.name.pt} was updated successfully.` });
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
        setSchools(prev => prev.filter(s => s.id !== schoolId));
        // We can keep the local reading plan update for immediate UI feedback
        setReadingPlan(prev => prev.filter(rp => rp.schoolId !== schoolId));
        toast({ title: "School Deleted", description: `School was deleted successfully.` });
    } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "Could not delete school.", variant: "destructive" });
    }
  };

  // Product mutations
  const addProduct = (product: Product) => {
    const newProduct = { ...product, id: `${product.type}-${Date.now()}` };
    setProducts(prev => [...prev, newProduct]);
    return newProduct; // Return new product with ID
  };
  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };
  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setReadingPlan(prev => prev.filter(rp => rp.productId !== productId));
  };

  // Reading Plan mutations
  const updateReadingPlanForProduct = (productId: string, newPlan: {schoolId: string, grade: number | string, status: 'mandatory' | 'recommended'}[]) => {
     const otherSchoolsPlan = readingPlan.filter(item => item.productId !== productId);
     const thisProductPlan: ReadingPlanItem[] = newPlan.map((rp, index) => ({
      id: `rp-${productId}-${index}-${Date.now()}`,
      productId: productId,
      schoolId: rp.schoolId,
      grade: rp.grade,
      status: rp.status,
    }));
    setReadingPlan([...otherSchoolsPlan, ...thisProductPlan]);
  }

  // Category mutations
  const addCategory = (category: Category) => {
    setCategories(prev => [...prev, category]);
  }
  const deleteCategory = (categoryName: string) => {
    setCategories(prev => prev.filter(c => c.name !== categoryName));
  }

  // Publisher mutations
  const addPublisher = (publisher: string) => {
      setPublishers(prev => [...prev, publisher]);
  }
  const deletePublisher = (publisherName: string) => {
      setPublishers(prev => prev.filter(p => p !== publisherName));
  }

  // Order mutations
  const addOrder = (order: Order) => {
    setOrders(prev => [...prev, order]);
  }
  const updateOrderPaymentStatus = (orderReference: string, status: Order['paymentStatus']) => {
    setOrders(prev => prev.map(order => 
      order.reference === orderReference ? { ...order, paymentStatus: status } : order
    ));
  }
  const updateOrderDeliveryStatus = (orderReference: string, status: Order['deliveryStatus']) => {
    const order = orders.find(o => o.reference === orderReference);
    if (!order) return;
    const originalStatus = order.deliveryStatus;
    
    setOrders(prev => prev.map(o => 
      o.reference === orderReference ? { ...o, deliveryStatus: status } : o
    ));

    if (status === 'delivered' && originalStatus !== 'delivered') {
        setProducts(prevProducts => {
          const newProducts = [...prevProducts];
          order.items.forEach(item => {
            const productIndex = newProducts.findIndex(p => p.id === item.id);
            if (productIndex > -1 && newProducts[productIndex].stock !== undefined) {
              newProducts[productIndex].stock! -= item.quantity;
            }
          });
          return newProducts;
        });
    }
  }

  return (
    <DataContext.Provider
      value={{
        schools, addSchool, updateSchool, deleteSchool, loadingSchools,
        products, addProduct, updateProduct, deleteProduct,
        readingPlan, updateReadingPlanForProduct,
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
