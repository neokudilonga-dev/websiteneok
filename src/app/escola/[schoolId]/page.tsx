import { getCachedProducts, getCachedSchools, getCachedReadingPlan } from "@/lib/admin-cache";
import { notFound } from "next/navigation";
import SchoolReadingPlanClient from "./client";
import type { School, Product, ReadingPlanItem } from "@/lib/types";

interface SchoolPageProps {
  params: Promise<{ schoolId: string }>;
}

async function getSchoolData(schoolId: string) {
  const [products, schools, readingPlan] = await Promise.all([
    getCachedProducts(),
    getCachedSchools(),
    getCachedReadingPlan(),
  ]);

  const school = schools.find((s: School) => s.id === schoolId);
  
  if (!school) {
    return null;
  }

  // Filter reading plan for this school
  const schoolReadingPlan = readingPlan.filter(
    (item: ReadingPlanItem) => item.schoolId === schoolId
  );

  // Get products for this school's reading plan
  const readingPlanProductIds = new Set(schoolReadingPlan.map((item) => item.productId));
  const schoolProducts = products.filter((p: Product) => readingPlanProductIds.has(p.id));

  return {
    school,
    products: schoolProducts,
    readingPlan: schoolReadingPlan,
    allProducts: products,
  };
}

export async function generateStaticParams() {
  const schools = await getCachedSchools();
  return schools.map((school: School) => ({
    schoolId: school.id,
  }));
}

export async function generateMetadata({ params }: SchoolPageProps) {
  const { schoolId } = await params;
  const data = await getSchoolData(schoolId);
  
  if (!data) {
    return {
      title: "Escola não encontrada | NEOKUDILONGA",
    };
  }

  const { school } = data;
  const schoolName = school.name 
    ? (typeof school.name === 'string' ? school.name : school.name.pt || 'Escola') 
    : 'Escola';

  return {
    title: `Plano de Leitura ${schoolName} | NEOKUDILONGA`,
    description: `Plano de leitura e lista de livros da ${schoolName}. Encomende os livros escolares facilmente.`,
  };
}

export default async function SchoolPage({ params }: SchoolPageProps) {
  const { schoolId } = await params;
  const data = await getSchoolData(schoolId);

  if (!data) {
    notFound();
  }

  return (
    <SchoolReadingPlanClient
      school={data.school}
      products={data.products}
      readingPlan={data.readingPlan}
      allProducts={data.allProducts}
    />
  );
}

export const dynamic = "force-static";
