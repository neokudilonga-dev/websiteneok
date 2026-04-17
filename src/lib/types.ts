

// Zod validation schemas (for API validation)
import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required').optional(),
  description: z.union([
    z.string(),
    z.object({
      pt: z.string(),
      en: z.string(),
    }),
  ]).optional(),
  price: z.number().nonnegative('Price must be non-negative'),
  stock: z.number().optional(),
  type: z.enum(["book", "game"]),
  dataAiHint: z.string().optional(),
  category: z.string().optional(),
  publisher: z.string().optional(),
  author: z.string().optional(),
  stockStatus: z.enum(['in_stock', 'out_of_stock', 'sold_out', 'low_stock']).optional(),
  status: z.enum(["mandatory", "recommended", "didactic_aids"]).optional(),
  highlight: z.boolean().optional(),
  storagePlace: z.string().length(3).regex(/^[A-Za-z]\d{2}$/, 'Must be Letter + 2 numbers').optional(),
});

export const ReadingPlanItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  schoolId: z.string(),
  grade: z.union([z.number(), z.string()]),
  status: z.enum(["mandatory", "recommended", "didactic_aids"]),
});

export interface ReadingPlanItem {
  id?: string;
  productId?: string;
  schoolId: string;
  grade: string | number;
  status: "mandatory" | "recommended" | "didactic_aids";
}

export interface School {
  id: string;
  name?: string | {
    pt: string;
    en: string;
  };
  description?: {
    pt: string;
    en: string;
  };
  abbreviation: string;
  allowPickup?: boolean;
  allowPickupAtLocation?: boolean;
  hasRecommendedPlan?: boolean;
  order?: number;
  logo?: string;
}


export interface Product {
  id: string;
  name?: string | {
    pt: string;
    en: string;
  };
  description?: string | {
    pt: string;
    en: string;
  };
  image?: string | string[]; // Update this line
  price: number;
  stock?: number;
  type: "book" | "game";
  dataAiHint?: string;
  category?: string;
  publisher?: string;
  author?: string;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'sold_out' | 'low_stock';
  status?: "mandatory" | "recommended" | "didactic_aids";
  highlight?: boolean;
  storagePlace?: string;
  readingPlan?: ReadingPlanItem[];
}

export interface CartItem extends Product {
  quantity: number;
  kitId?: string;
  kitName?: string;
}

export type PaymentStatus = 'paid' | 'unpaid' | 'partially_paid' | 'cancelled' | 'cod';
export type DeliveryStatus = 'delivered' | 'not_delivered' | 'school_pickup' | 'out_of_stock' | 'cancelled';

export interface Order {
  id?: string;
  reference: string;
  date: string;
  createdAt?: string;
  language?: 'pt' | 'en';
  paidAt?: string;
  deliveredAt?: string;
  studentName?: string;
  studentClass?: string;
  guardianName: string;
  phone: string;
  email: string | null;
  deliveryOption: string;
  deliveryAddress: string | null;
  preferredDeliveryTime?: string | null;
  paymentMethod: string;
  items: CartItem[];
  total: number;
  deliveryFee: number;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  deliveryDate?: string;
  schoolId?: string;
  schoolName?: string;
  paymentProof?: string;
}

export interface Category {
  id: string;
  name: {
    pt: string;
    en: string;
  };
  type: 'book' | 'game';
}

export interface DeliverySettings {
  id: string;
  // Delivery fees
  feeTalatona: number;
  feeOutsideTalatona: number;
  feeOutsideZones: number;
  // Exemption thresholds (0 = no exemption)
  exemptionTalatona: number;
  exemptionOutsideTalatona: number;
  // Updated at
  updatedAt: string;
}
