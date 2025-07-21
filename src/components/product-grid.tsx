import type { Product } from "@/lib/types";
import ProductCard from "./product-card";

interface ProductGridProps {
  products: Product[];
  renderBadge?: (product: Product) => React.ReactNode;
}

export default function ProductGrid({ products, renderBadge }: ProductGridProps) {
  if (products.length === 0) {
    return (
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
            <h3 className="font-headline text-2xl font-semibold tracking-tight">Nenhum item encontrado</h3>
            <p className="text-muted-foreground">Ainda não há livros ou jogos disponíveis.</p>
        </div>
    )
  }
  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} renderBadge={renderBadge} />
      ))}
    </div>
  );
}
