

// Zod validation schemas (for API validation)
import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().nonnegative('Price must be non-negative'),
  stock: z.number().optional(),
  image: z.string(),
  images: z.array(z.string()),
  type: z.enum(["book", "game"]),
  dataAiHint: z.string().optional(),
  category: z.string().optional(),
  publisher: z.string().optional(),
  stockStatus: z.enum(['in_stock', 'out_of_stock', 'sold_out']).optional(),
  status: z.enum(["mandatory", "recommended"]).optional(),
});

export const ReadingPlanItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  schoolId: z.string(),
  grade: z.union([z.number(), z.string()]),
  status: z.enum(["mandatory", "recommended"]),
});

export interface ReadingPlanItem {
  id: string;
  productId: string;
  schoolId: string;
  grade: number | string;
  status: "mandatory" | "recommended";
}

export interface School {
  id: string;
  name: {
    pt: string;
    en: string;
  };
  abbreviation: string;
  allowPickup?: boolean;
  allowPickupAtLocation?: boolean;
  hasRecommendedPlan?: boolean;
}


export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock?: number;
  image: string;
  images?: string[];
  type: "book" | "game";
  dataAiHint?: string;
  category?: string;
  publisher?: string;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'sold_out';
  status?: "mandatory" | "recommended";
}

export interface CartItem extends Product {
  quantity: number;
  kitId?: string;
  kitName?: string;
}

export type PaymentStatus = 'paid' | 'unpaid' | 'partially_paid' | 'cancelled' | 'cod';
export type DeliveryStatus = 'delivered' | 'not_delivered' | 'school_pickup' | 'out_of_stock' | 'cancelled';

export interface Order {
  reference: string;
  date: string;
  studentName?: string;
  guardianName: string;
  phone: string;
  email: string;
  deliveryOption: string;
  deliveryAddress: string | null;
  paymentMethod: string;
  items: CartItem[];
  total: number;
  deliveryFee: number;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  schoolId?: string;
  schoolName?: string;
}

export interface Category {
  name: {
    pt: string;
    en: string;
  };
  type: 'book' | 'game';
}
