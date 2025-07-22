

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
  stockStatus?: 'in_stock' | 'out_of_stock' | 'sold_out';
  status?: "mandatory" | "recommended"; // used for reading plan view
}

export interface ReadingPlanItem {
  id: string;
  productId: string;
  schoolId: string;
  grade: number;
  status: "mandatory" | "recommended";
}

export interface School {
  id: string;
  name: string;
  allowPickup?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  kitId?: string;
  kitName?: string;
}

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
  status: 'pending' | 'completed';
}
