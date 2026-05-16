import React, { useMemo } from "react";
import ProductGrid from "@/components/product-grid";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/language-context";
import { normalizeGradeKey, resolveReadingPlanBucket } from "@/lib/reading-plan-utils";
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
    () =>
      schoolReadingPlan.filter(
        (p) => normalizeGradeKey(p.grade) === normalizeGradeKey(grade)
      ),
    [schoolReadingPlan, grade]
  );

  return (
    <ProductGrid
      products={products}
      productBadgeRenderer={(product: Product) => {
        const planItem = gradePlan.find((gp) => gp.productId === product.id);
        if (planItem) {
          const bucket = resolveReadingPlanBucket(planItem.grade, planItem.status);
          let badgeLabel = t("shop.recommended");
          let badgeVariant: "default" | "secondary" | "outline" = "secondary";

          if (bucket === "mandatory") {
            badgeLabel = t("shop.mandatory");
            badgeVariant = "default";
          } else if (bucket === "didactic_aids") {
            badgeLabel = t("shop.didactic_aids");
            badgeVariant = "outline";
          }

          return (
            <Badge
              variant={badgeVariant}
              className="capitalize"
            >
              {badgeLabel}
            </Badge>
          );
        }
        return null;
      }}
    />
  );
};

export default ProductGridWithBadges;