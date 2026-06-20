"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Product = { _id: string; title: string; amount: number };
type CartItem = { product: Product; qty: number };

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pharmacy_cart");
      if (stored) {
        try {
          setCart(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse cart", e);
        }
      }
    }
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.product._id === product._id);
      let updated;
      if (exists) {
        updated = prev.map((item) => item.product._id === product._id ? { ...item, qty: item.qty + 1 } : item);
      } else {
        updated = [...prev, { product, qty: 1 }];
      }
      localStorage.setItem("pharmacy_cart", JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.product._id !== id);
      localStorage.setItem("pharmacy_cart", JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("pharmacy_cart");
  };

  return <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
