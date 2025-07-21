import type { School, Product, ReadingPlanItem } from "@/lib/types";

export const schools: School[] = [
  { id: "escola-a", name: "Escola Primária de Luanda" },
  { id: "escola-b", name: "Colégio Pitruca" },
  { id: "escola-c", name: "Liceu Angolano de Luanda" },
];

export const products: Product[] = [
  {
    id: "book-1",
    name: "Jornada da Matemática 1º Ano",
    description: "Um livro de matemática interativo para a primeira classe.",
    price: 1599.00,
    image: "https://placehold.co/600x400.png",
    images: [],
    type: "book",
    dataAiHint: "math textbook"
  },
  {
    id: "book-2",
    name: "Explorador da Ciência 1º Ano",
    description: "Descubra o mundo ao seu redor com experiências divertidas.",
    price: 1850.00,
    image: "https://placehold.co/600x400.png",
    images: [],
    type: "book",
    dataAiHint: "science textbook"
  },
  {
    id: "game-1",
    name: "Blocos do Alfabeto",
    description: "Uma forma divertida de aprender o alfabeto.",
    price: 2500.00,
    image: "",
    images: ["https://placehold.co/600x400.png", "https://placehold.co/600x400.png"],
    type: "game",
    dataAiHint: "alphabet blocks"
  },
  {
    id: "book-3",
    name: "Química Avançada",
    description: "Um guia completo de química para o ensino secundário.",
    price: 3500.00,
    image: "https://placehold.co/600x400.png",
    images: [],
    type: "book",
    dataAiHint: "chemistry textbook"
  },
  {
    id: "book-4",
    name: "História de Angola",
    description: "Dos reinos antigos aos dias de hoje.",
    price: 2299.00,
    image: "https://placehold.co/600x400.png",
    images: [],
    type: "book",
    dataAiHint: "history book"
  },
  {
    id: "game-2",
    name: "Mestre do Código",
    description: "Aprenda a lógica de programação através de um divertido jogo de tabuleiro.",
    price: 4500.00,
    image: "",
    images: ["https://placehold.co/600x400.png"],
    type: "game",
    dataAiHint: "coding game"
  },
  {
    id: "book-5",
    name: "Gramática Portuguesa",
    description: "Domine as regras da língua portuguesa.",
    price: 1999.00,
    image: "https://placehold.co/600x400.png",
    images: [],
    type: "book",
    dataAiHint: "language book"
  },
  {
    id: "book-6",
    name: "Atlas do Mundo",
    description: "Explore o mundo com mapas detalhados.",
    price: 2995.00,
    image: "https://placehold.co/600x400.png",
    images: [],
    type: "book",
    dataAiHint: "atlas book"
  },
   {
    id: "game-3",
    name: "Duelo de Feiticeiros Matemáticos",
    description: "Um jogo de cartas competitivo para praticar habilidades matemáticas.",
    price: 1450.00,
    image: "",
    images: ["https://placehold.co/600x400.png"],
    type: "game",
    dataAiHint: "math game"
  },
   {
    id: "game-4",
    name: "Cidade Estratégica",
    description: "Construa a sua própria cidade e gira os recursos.",
    price: 3999.00,
    image: "",
    images: ["https://placehold.co/600x400.png"],
    type: "game",
    dataAiHint: "board game"
  },
  {
    id: "book-7",
    name: "Física para Principiantes",
    description: "Introdução aos conceitos fundamentais da física.",
    price: 3200.00,
    image: "https://placehold.co/600x400.png",
    images: [],
    type: "book",
    dataAiHint: "physics textbook"
  },
  {
    id: "book-8",
    name: "Clássicos da Literatura",
    description: "Uma coleção de obras literárias clássicas.",
    price: 2450.00,
    image: "https://placehold.co/600x400.png",
    images: [],
    type: "book",
    dataAiHint: "literature book"
  }
];

export const readingPlan: ReadingPlanItem[] = [
    { id: 'rp-1', productId: 'book-1', schoolId: 'escola-a', grade: 1, status: 'mandatory' },
    { id: 'rp-2', productId: 'book-2', schoolId: 'escola-a', grade: 1, status: 'recommended' },
    { id: 'rp-3', productId: 'book-3', schoolId: 'escola-c', grade: 12, status: 'mandatory' },
    { id: 'rp-4', productId: 'book-4', schoolId: 'escola-b', grade: 8, status: 'mandatory' },
    { id: 'rp-5', productId: 'book-4', schoolId: 'escola-c', grade: 9, status: 'mandatory' },
    { id: 'rp-6', productId: 'book-5', schoolId: 'escola-b', grade: 7, status: 'mandatory' },
    { id: 'rp-7', productId: 'book-7', schoolId: 'escola-c', grade: 11, status: 'mandatory' },
];
