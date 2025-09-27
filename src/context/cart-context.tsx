
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { CartItem, Product } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from "./language-context";
import { getDisplayName } from "@/lib/utils";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  addKitToCart: (products: Product[], kitName: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id && !item.kitId);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id && !item.kitId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
    toast({
      title: t('cart.toast.added_title'),
      description: t('cart.toast.added_description', { name: getDisplayName(product.name, language) }),
    });
  };

  const addKitToCart = (products: Product[], kitName: string) => {
     const kitId = uuidv4();
    setCartItems((prevItems) => {
      const newItems = [...prevItems];
      products.forEach(product => {
        // For kits, we add them as new line items even if they exist individually.
        newItems.push({ ...product, quantity: 1, kitId, kitName });
      });
      return newItems;
    });

    const productNames = products.map(p => getDisplayName(p.name, language)).join(', ');
    toast({
      title: t('cart.toast.kit_added_title'),
      description: (
        <div>
            <p className="font-semibold">{kitName}</p>
            <p>{t('cart.toast.kit_added_description')} {productNames}.</p>
        </div>
      )
    });
  };

  const removeFromCart = (productId: string) => {
    const itemToRemove = cartItems.find(item => item.id === productId);
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
     toast({
      title: t('cart.toast.removed_title'),
      description: t('cart.toast.removed_description', { name: getDisplayName(itemToRemove?.name, language) }),
      variant: 'destructive'
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const cartTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        addKitToCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
