

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock?: number;
  image: string; // For books
  images: string[]; // For games
  type: "book" | "game";
  dataAiHint?: string;
  category?: string; // e.g., 'Ficção', 'Manual Escolar', 'Ciência'
  publisher?: string;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'sold_out';
  status?: "mandatory" | "recommended"; // used for reading plan view
}

export interface ReadingPlanItem {
  id: string;
  productId: string;
  schoolId: string;
  grade: number | string;
  status: "mandatory" | "recommended";
}

export interface School {
  id: string;
  name: string;
  abbreviation: string;
  allowPickup?: boolean;
  allowPickupAtLocation?: boolean;
  hasRecommendedPlan?: boolean;
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
    name: string;
    type: 'book' | 'game';
}
