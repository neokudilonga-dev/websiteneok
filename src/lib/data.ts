
import type { Product, ReadingPlanItem, Order, Category, School } from "@/lib/types";

// This file now only contains empty arrays. 
// All data is managed in Firestore and fetched via API routes.
// The data will be populated by using the Admin Panel.

export const allCategories: Category[] = [];

export const publishers: string[] = [];

export const products: Product[] = [];

export const readingPlan: ReadingPlanItem[] = [];

export const orders: Order[] = [];

// Schools are also fetched from the DB, but we keep an empty array here.
export const schools: School[] = [];
