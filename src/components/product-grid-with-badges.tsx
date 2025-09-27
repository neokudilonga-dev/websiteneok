import React, { useMemo } from "react";
import ProductGrid from "@/components/product-grid";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/language-context";
import type { Product, ReadingPlanItem } from "@/lib/types";

interface ProductGridWithBadgesProps {
  products: Product[];
  grade: string;
  schoolReadingPlan: ReadingPlanItem[];
}

const ProductGridWithBadges: React.FC<ProductGridWithBadgesProps> = ({
  products,
  grade,
  schoolReadingPlan,
}) => {
  const { t } = useLanguage();

  const gradePlan = useMemo(
    () => schoolReadingPlan.filter((p) => String(p.grade) === grade),
    [schoolReadingPlan, grade]
  );

  return (
    <ProductGrid
      products={products}
      productBadgeRenderer={(product: Product) => {
        const planItem = gradePlan.find((gp) => gp.productId === product.id);
        if (planItem) {
          return (
            <Badge
              variant={planItem.status === "mandatory" ? "default" : "secondary"}
              className="capitalize"
            >
              {planItem.status === "mandatory"
                ? t("shop.mandatory")
                : t("shop.recommended")}
            </Badge>
          );
        }
        return null;
      }}
    />
  );
};

export default ProductGridWithBadges;