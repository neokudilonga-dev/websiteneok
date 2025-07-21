export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  type: "book" | "game";
  // grade and schoolIds are no longer here
  dataAiHint?: string;
}

export interface ReadingPlanItem {
  id: string;
  productId: string;
  schoolId: string;
  grade: number;
}

export interface School {
  id: string;
  name: string;
}

export interface CartItem extends Product {
  quantity: number;
}
