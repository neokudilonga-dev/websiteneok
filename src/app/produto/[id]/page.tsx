import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getProductById } from "@/lib/products";
import { normalizeImageUrl, getDisplayName } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import AddToCartButton from "./add-to-cart-button";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  
  if (!product) {
    return {
      title: "Produto não encontrado | Neokudilonga",
    };
  }
  
  const displayName = getDisplayName(product.name, "pt");
  
  return {
    title: `${displayName} | Neokudilonga`,
    description: typeof product.description === "string" 
      ? product.description 
      : (product.description?.pt || ""),
  };
}

export async function generateStaticParams() {
  // This will be populated at runtime by Firebase App Hosting
  return [];
}

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  
  if (!product) {
    notFound();
  }
  
  const displayName = getDisplayName(product.name, "pt");
  const displayNameEn = getDisplayName(product.name, "en");
  const displayDescription = typeof product.description === "string"
    ? product.description
    : (product.description?.pt || "");
  const displayDescriptionEn = typeof product.description === "object" && product.description !== null
    ? (product.description?.en || "")
    : "";
  
  const isOutOfStock = product.stockStatus === "out_of_stock";
  const isGame = product.type === "game";
  
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/loja" className="hover:text-primary">
            Loja
          </Link>
          <span>/</span>
          <Link href={isGame ? "/loja?tab=jogos" : "/loja?tab=catalogo"} className="hover:text-primary">
            {isGame ? "Jogos e Outros" : "Livros"}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{displayName}</span>
        </nav>
        
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <Link 
              href={isGame ? "/loja?tab=jogos" : "/loja?tab=catalogo"}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar à loja
            </Link>
            
            {Array.isArray(product.image) && product.image.length > 1 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {product.image.map((img: string, index: number) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={normalizeImageUrl(img)}
                          alt={`${displayName} - Imagem ${index + 1}`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority={index === 0}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            ) : (
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  src={normalizeImageUrl(Array.isArray(product.image) ? product.image[0] : product.image)}
                  alt={displayName}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            )}
            
            {/* Thumbnail gallery for multiple images */}
            {Array.isArray(product.image) && product.image.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.image.map((img: string, index: number) => (
                  <div 
                    key={index}
                    className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted"
                  >
                    <Image
                      src={normalizeImageUrl(img)}
                      alt={`${displayName} - Miniatura ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge className={isGame ? "bg-teal-600" : ""} variant={isGame ? "default" : "secondary"}>
                  {isGame ? "Jogo e Outros" : "Livro"}
                </Badge>
                {isOutOfStock && (
                  <Badge variant="outline" className="border-red-500 text-red-500">
                    Esgotado
                  </Badge>
                )}
              </div>
              
              <h1 className="font-headline text-3xl font-bold text-primary">
                {displayName}
              </h1>
              {displayNameEn && displayNameEn !== displayName && (
                <p className="mt-1 text-lg text-muted-foreground">
                  {displayNameEn}
                </p>
              )}
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-3xl font-bold text-primary">
                {(product.price || 0).toLocaleString("pt-PT", {
                  style: "currency",
                  currency: "AOA",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </span>
              {product.stockStatus === "low_stock" && (
                <span className="text-sm text-yellow-600">
                  Stock limitado
                </span>
              )}
            </div>
            
            {/* Product Details */}
            <Card>
              <CardContent className="p-6 space-y-4">
                {product.author && (
                  <div>
                    <span className="text-sm text-muted-foreground">Autor:</span>
                    <p className="font-medium">{product.author}</p>
                  </div>
                )}
                
                {product.publisher && (
                  <div>
                    <span className="text-sm text-muted-foreground">Editora:</span>
                    <p className="font-medium">{product.publisher}</p>
                  </div>
                )}
                
                {product.category && (
                  <div>
                    <span className="text-sm text-muted-foreground">Categoria:</span>
                    <p className="font-medium">{product.category}</p>
                  </div>
                )}
                
                {product.stock !== undefined && (
                  <div>
                    <span className="text-sm text-muted-foreground">Stock disponível:</span>
                    <p className="font-medium">{product.stock} unidades</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Description */}
            {(displayDescription || displayDescriptionEn) && (
              <div className="space-y-4">
                {displayDescription && (
                  <div>
                    <h2 className="mb-2 font-headline text-lg font-semibold">Descrição</h2>
                    <p className="text-muted-foreground leading-relaxed">{displayDescription}</p>
                  </div>
                )}
                {displayDescriptionEn && (
                  <div>
                    <h2 className="mb-2 font-headline text-lg font-semibold">Description</h2>
                    <p className="text-muted-foreground leading-relaxed">{displayDescriptionEn}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Add to Cart */}
            <div className="pt-4">
              <AddToCartButton product={product} isOutOfStock={isOutOfStock} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
