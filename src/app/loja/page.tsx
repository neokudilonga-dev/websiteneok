
import { Suspense } from 'react';
import ShopPageContent from '@/components/shop-page-content';

function ShopPageLoading() {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="font-headline text-xl text-muted-foreground">A carregar a loja...</div>
        </div>
    )
}

export default function LojaPage() {
  return (
    <Suspense fallback={<ShopPageLoading />}>
      <ShopPageContent />
    </Suspense>
  );
}
