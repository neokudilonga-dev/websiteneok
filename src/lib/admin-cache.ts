
import { firestore } from "@/lib/firebase-admin";
import { unstable_cache } from "next/cache";
import type { Product, ReadingPlanItem, School, Category, Order } from "@/lib/types";

export const getCachedProducts = unstable_cache(
  async () => {
    console.log("[Server Cache] Fetching products from Firestore");
    const snapshot = await firestore.collection('products').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any as Product));
  },
  ['admin-products'],
  { revalidate: 86400, tags: ['products', 'shop'] }
);

export const getCachedReadingPlan = unstable_cache(
  async () => {
    console.log("[Server Cache] Fetching reading plan from Firestore");
    const snapshot = await firestore.collection('readingPlan').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any as ReadingPlanItem));
  },
  ['admin-reading-plan'],
  { revalidate: 86400, tags: ['reading-plan', 'shop'] }
);

export const getCachedSchools = unstable_cache(
  async () => {
    console.log("[Server Cache] Fetching schools from Firestore");
    const snapshot = await firestore.collection('schools').get();
    const schools = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any as School));
    // Ordenar por 'order' (se existir) ou por nome como fallback
    return schools.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  },
  ['admin-schools'],
  { revalidate: 86400, tags: ['schools', 'shop'] }
);

export const getCachedCategories = unstable_cache(
  async () => {
    console.log("[Server Cache] Fetching categories from Firestore");
    const snapshot = await firestore.collection('categories').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any as Category));
  },
  ['admin-categories'],
  { revalidate: 86400, tags: ['categories', 'shop'] }
);

export const getCachedPublishers = unstable_cache(
  async () => {
    console.log("[Server Cache] Fetching publishers from Firestore");
    const snapshot = await firestore.collection('publishers').get();
    return snapshot.docs.map(doc => doc.id);
  },
  ['admin-publishers'],
  { revalidate: 86400, tags: ['publishers', 'shop'] }
);

export const getCachedOrders = unstable_cache(
  async () => {
    try {
      console.log("[Server Cache] Fetching orders from Firestore - Start");
      // Tentamos buscar ordenado por createdAt
      let snapshot = await firestore.collection('orders').orderBy('createdAt', 'desc').get();
      
      // Se não houver resultados, pode ser que alguns documentos não tenham o campo createdAt
      // e o Firestore os exclui da consulta ordenada. Tentamos buscar todos se vier vazio.
      if (snapshot.empty) {
        console.log("[Server Cache] No orders found with orderBy. Fetching all orders...");
        snapshot = await firestore.collection('orders').get();
      }

      const orders = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          // Fallback para createdAt se estiver faltando
          createdAt: data.createdAt || data.date || new Date().toISOString()
        } as any as Order;
      });

      // Ordenação manual se necessário
      orders.sort((a, b) => {
        const bDate = (b.createdAt || (b as any).date) as string;
        const aDate = (a.createdAt || (a as any).date) as string;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });

      console.log(`[Server Cache] Successfully fetched ${orders.length} orders from Firestore`);
      return orders;
    } catch (error) {
      console.error("[Server Cache] Error fetching orders from Firestore:", error);
      return [];
    }
  },
  ['admin-orders'],
  { revalidate: 300, tags: ['orders'] } // Orders cache shorter (5 min)
);
