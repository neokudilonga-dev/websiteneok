export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  type: "book" | "game";
  schoolIds?: string[]; // Changed from schoolId: string
  grade?: number;
  dataAiHint?: string;
}

export interface School {
  id: string;
  name: string;
}

export interface CartItem extends Product {
  quantity: number;
}
