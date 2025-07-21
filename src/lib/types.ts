export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string; // For books
  images: string[]; // For games
  type: "book" | "game";
  dataAiHint?: string;
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
}

export interface CartItem extends Product {
  quantity: number;
}
