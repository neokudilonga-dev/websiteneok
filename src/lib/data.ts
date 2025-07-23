
import type { School, Product, ReadingPlanItem, Order } from "@/lib/types";

export const schools: School[] = [
  { id: "palanquinhas", name: "Palanquinhas", abbreviation: "PAL", allowPickup: true, allowPickupAtLocation: true },
];

export const bookCategories = ["Manual Escolar", "Ficção", "Não-Ficção", "Ciência", "História", "Literatura", "Obrigatórios/ Leitura Orientada", "Sugeridos/ Leitura Recomendada"];

export const publishers = ["Editora Angola", "Livros & Cia", "Saber Mais", "Plural Editores", "Mayamba Editora", "Texto Editores", "ASA"];

export const products: Product[] = [
  // 1st Grade
  { id: 'pal-1-1', name: 'Estrofes da Bicharada', price: 5500, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '1ª Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  { id: 'pal-1-2', name: 'Lengalengas Trava-línguas', price: 6500, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '1ª Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  { id: 'pal-1-3', name: 'O Passeio dos Patos', price: 4500, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '1ª Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  
  // 2nd Grade
  { id: 'pal-2-1', name: 'Histórias com Adivinhas', price: 5500, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '2ª Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  { id: 'pal-2-2', name: 'União Arco-Íris', price: 4500, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '2ª Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  { id: 'pal-2-3', name: 'Tombe menino perna mágica', price: 3500, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '2ª Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },

  // 3rd Grade
  { id: 'pal-3-1', name: 'Vari a incrível Palanca', price: 5000, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '3ª Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  { id: 'pal-3-2', name: 'Corpos Celestes', price: 5500, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '3ª Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  { id: 'pal-3-3', name: 'Sona a Beleza de um desenho', price: 5500, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '3ª Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },

  // 4th Grade
  { id: 'pal-4-1', name: 'Duas Abelhas Amigas de um Girassol', price: 5500, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '4ª Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  { id: 'pal-4-2', name: 'A Mangueira dos Kwanzas', price: 5000, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '4ª Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  { id: 'pal-4-3', name: 'Gosto deles porque sim', price: 7000, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '4ª Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },

  // 5th Grade
  { id: 'pal-5-1', name: 'A Idade da Memória', price: 10000, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '5ª Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  { id: 'pal-5-2', name: 'Guerra dos Fazedores de chuva', price: 8000, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '5ª Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  { id: 'pal-5-3', name: 'O Livro que falava com o vento', price: 6000, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '5ª Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },

  // 6th Grade
  { id: 'pal-6-1', name: 'Determinação', price: 7000, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '6ª Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  { id: 'pal-6-2', name: 'Com verso comigo', price: 3000, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '6ª Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  { id: 'pal-6-3', name: 'O Principezinho', price: 10000, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '6ª Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },

  // 7th Grade
  { id: 'pal-7-1', name: 'Quem me dera ser onda', price: 6000, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '7a Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  { id: 'pal-7-2', name: 'Os vivos, o morto e o peixe frito', price: 7000, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '7a Classe (com pequenos defeitos que não afectam a leitura)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  { id: 'pal-7-3', name: 'Alma de Kaluanda', price: 7500, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '7a Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },

  // 8th Grade
  { id: 'pal-8-1', name: 'Os da minha rua', price: 10000, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '8a Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  { id: 'pal-8-2', name: 'Fábulas de Sanji', price: 6000, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '8a Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  { id: 'pal-8-3', name: 'Vidas Novas', price: 4000, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '8a Classe (com pequenos defeitos que não afectam a leitura)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  
  // 9th Grade
  { id: 'pal-9-1', name: 'Undengue', price: 5000, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '9a Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  { id: 'pal-9-2', name: 'Do rio ao Mar', price: 5000, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '9a Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
  { id: 'pal-9-3', name: 'Teoria Geral do Esquecimento', price: 10000, stock: 100, type: 'book', image: "https://placehold.co/600x400.png", images: [], description: '9a Classe (Obrigatórios/ Leitura Orientada)', category: 'Obrigatórios/ Leitura Orientada', stockStatus: "in_stock" },
];

export const readingPlan: ReadingPlanItem[] = [
    // 1st Grade
    { id: 'rp-pal-1-1', productId: 'pal-1-1', schoolId: 'palanquinhas', grade: 1, status: 'mandatory' },
    { id: 'rp-pal-1-2', productId: 'pal-1-2', schoolId: 'palanquinhas', grade: 1, status: 'mandatory' },
    { id: 'rp-pal-1-3', productId: 'pal-1-3', schoolId: 'palanquinhas', grade: 1, status: 'mandatory' },
    
    // 2nd Grade
    { id: 'rp-pal-2-1', productId: 'pal-2-1', schoolId: 'palanquinhas', grade: 2, status: 'mandatory' },
    { id: 'rp-pal-2-2', productId: 'pal-2-2', schoolId: 'palanquinhas', grade: 2, status: 'mandatory' },
    { id: 'rp-pal-2-3', productId: 'pal-2-3', schoolId: 'palanquinhas', grade: 2, status: 'mandatory' },

    // 3rd Grade
    { id: 'rp-pal-3-1', productId: 'pal-3-1', schoolId: 'palanquinhas', grade: 3, status: 'mandatory' },
    { id: 'rp-pal-3-2', productId: 'pal-3-2', schoolId: 'palanquinhas', grade: 3, status: 'mandatory' },
    { id: 'rp-pal-3-3', productId: 'pal-3-3', schoolId: 'palanquinhas', grade: 3, status: 'mandatory' },

    // 4th Grade
    { id: 'rp-pal-4-1', productId: 'pal-4-1', schoolId: 'palanquinhas', grade: 4, status: 'mandatory' },
    { id: 'rp-pal-4-2', productId: 'pal-4-2', schoolId: 'palanquinhas', grade: 4, status: 'mandatory' },
    { id: 'rp-pal-4-3', productId: 'pal-4-3', schoolId: 'palanquinhas', grade: 4, status: 'mandatory' },

    // 5th Grade
    { id: 'rp-pal-5-1', productId: 'pal-5-1', schoolId: 'palanquinhas', grade: 5, status: 'mandatory' },
    { id: 'rp-pal-5-2', productId: 'pal-5-2', schoolId: 'palanquinhas', grade: 5, status: 'mandatory' },
    { id: 'rp-pal-5-3', productId: 'pal-5-3', schoolId: 'palanquinhas', grade: 5, status: 'mandatory' },

    // 6th Grade
    { id: 'rp-pal-6-1', productId: 'pal-6-1', schoolId: 'palanquinhas', grade: 6, status: 'mandatory' },
    { id: 'rp-pal-6-2', productId: 'pal-6-2', schoolId: 'palanquinhas', grade: 6, status: 'mandatory' },
    { id: 'rp-pal-6-3', productId: 'pal-6-3', schoolId: 'palanquinhas', grade: 6, status: 'mandatory' },

    // 7th Grade
    { id: 'rp-pal-7-1', productId: 'pal-7-1', schoolId: 'palanquinhas', grade: 7, status: 'mandatory' },
    { id: 'rp-pal-7-2', productId: 'pal-7-2', schoolId: 'palanquinhas', grade: 7, status: 'mandatory' },
    { id: 'rp-pal-7-3', productId: 'pal-7-3', schoolId: 'palanquinhas', grade: 7, status: 'mandatory' },

    // 8th Grade
    { id: 'rp-pal-8-1', productId: 'pal-8-1', schoolId: 'palanquinhas', grade: 8, status: 'mandatory' },
    { id: 'rp-pal-8-2', productId: 'pal-8-2', schoolId: 'palanquinhas', grade: 8, status: 'mandatory' },
    { id: 'rp-pal-8-3', productId: 'pal-8-3', schoolId: 'palanquinhas', grade: 8, status: 'mandatory' },

    // 9th Grade
    { id: 'rp-pal-9-1', productId: 'pal-9-1', schoolId: 'palanquinhas', grade: 9, status: 'mandatory' },
    { id: 'rp-pal-9-2', productId: 'pal-9-2', schoolId: 'palanquinhas', grade: 9, status: 'mandatory' },
    { id: 'rp-pal-9-3', productId: 'pal-9-3', schoolId: 'palanquinhas', grade: 9, status: 'mandatory' },
];

export const orders: Order[] = [];
