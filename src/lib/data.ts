import type { School, Product } from "@/lib/types";

export const schools: School[] = [
  { id: "escola-a", name: "Escola Primária de Luanda" },
  { id: "escola-b", name: "Colégio Pitruca" },
  { id: "escola-c", name: "Liceu Angolano de Luanda" },
];

export const products: Product[] = [
  {
    id: "book-1",
    name: "Math Journey Grade 1",
    description: "An interactive math book for first graders.",
    price: 15.99,
    image: "https://placehold.co/600x400.png",
    type: "book",
    schoolId: "escola-a",
    grade: 1,
    dataAiHint: "math textbook"
  },
  {
    id: "book-2",
    name: "Science Explorer Grade 1",
    description: "Discover the world around you with fun experiments.",
    price: 18.5,
    image: "https://placehold.co/600x400.png",
    type: "book",
    schoolId: "escola-a",
    grade: 1,
    dataAiHint: "science textbook"
  },
  {
    id: "game-1",
    name: "Alphabet Blocks",
    description: "A fun way to learn the alphabet.",
    price: 25.0,
    image: "https://placehold.co/600x400.png",
    type: "game",
    schoolId: "escola-a",
    dataAiHint: "alphabet blocks"
  },
  {
    id: "book-3",
    name: "Advanced Chemistry",
    description: "A comprehensive guide to high school chemistry.",
    price: 35.0,
    image: "https://placehold.co/600x400.png",
    type: "book",
    schoolId: "escola-c",
    grade: 12,
    dataAiHint: "chemistry textbook"
  },
  {
    id: "book-4",
    name: "História de Angola",
    description: "From ancient kingdoms to modern day.",
    price: 22.99,
    image: "https://placehold.co/600x400.png",
    type: "book",
    schoolId: "escola-b",
    grade: 8,
    dataAiHint: "history book"
  },
  {
    id: "game-2",
    name: "Code Master",
    description: "Learn programming logic through a fun board game.",
    price: 45.0,
    image: "https://placehold.co/600x400.png",
    type: "game",
    schoolId: "escola-c",
    dataAiHint: "coding game"
  },
  {
    id: "book-5",
    name: "Portuguese Grammar",
    description: "Master the rules of Portuguese.",
    price: 19.99,
    image: "https://placehold.co/600x400.png",
    type: "book",
    schoolId: "escola-b",
    grade: 7,
    dataAiHint: "language book"
  },
  {
    id: "book-6",
    name: "World Atlas",
    description: "Explore the world with detailed maps.",
    price: 29.95,
    image: "https://placehold.co/600x400.png",
    type: "book",
    schoolId: "escola-b",
    grade: 7,
    dataAiHint: "atlas book"
  },
   {
    id: "game-3",
    name: "Math Wizards Duel",
    description: "A competitive card game for practicing math skills.",
    price: 14.50,
    image: "https://placehold.co/600x400.png",
    type: "game",
    schoolId: "escola-b",
    dataAiHint: "math game"
  },
   {
    id: "game-4",
    name: "Strategy City",
    description: "Build your own city and manage resources.",
    price: 39.99,
    image: "https://placehold.co/600x400.png",
    type: "game",
    schoolId: "escola-c",
    dataAiHint: "board game"
  },
  {
    id: "book-7",
    name: "Physics for Beginners",
    description: "Introduction to the fundamental concepts of physics.",
    price: 32.0,
    image: "https://placehold.co/600x400.png",
    type: "book",
    schoolId: "escola-c",
    grade: 11,
    dataAiHint: "physics textbook"
  },
  {
    id: "book-8",
    name: "Literature Classics",
    description: "A collection of classic literary works.",
    price: 24.50,
    image: "https://placehold.co/600x400.png",
    type: "book",
    schoolId: "escola-c",
    grade: 12,
    dataAiHint: "literature book"
  }
];
