
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { School, Product, ReadingPlanItem, Order, Category } from "@/lib/types";
import { 
    schools as initialSchools, 
    products as initialProducts, 
    readingPlan as initialReadingPlan, 
    allCategories as initialCategories,
    publishers as initialPublishers,
    orders as initialOrders
} from "@/lib/data";

interface DataContextType {
  // Schools
  schools: School[];
  addSchool: (school: School) => void;
  updateSchool: (school: School) => void;
  deleteSchool: (schoolId: string) => void;

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
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [readingPlan, setReadingPlan] = useState<ReadingPlanItem[]>(initialReadingPlan);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [publishers, setPublishers] = useState<string[]>(initialPublishers);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // School mutations
  const addSchool = (school: School) => {
    setSchools(prev => [...prev, { ...school, id: `school-${Date.now()}` }]);
  };
  const updateSchool = (updatedSchool: School) => {
    setSchools(prev => prev.map(s => s.id === updatedSchool.id ? updatedSchool : s));
  };
  const deleteSchool = (schoolId: string) => {
    setSchools(prev => prev.filter(s => s.id !== schoolId));
    setReadingPlan(prev => prev.filter(rp => rp.schoolId !== schoolId));
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
        schools, addSchool, updateSchool, deleteSchool,
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
