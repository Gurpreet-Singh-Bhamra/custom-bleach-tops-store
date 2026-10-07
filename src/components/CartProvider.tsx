"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: string;
  title: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  isReady: boolean;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  removeItem: (productId: string, size: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CART_STORAGE_KEY = "bleach-tops-cart";

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function matchesItem(
  entry: CartItem,
  productId: string,
  size: string,
) {
  return entry.productId === productId && entry.size === size;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((current) => {
      const matchIndex = current.findIndex((entry) =>
        matchesItem(entry, item.productId, item.size),
      );

      if (matchIndex === -1) {
        return [...current, { ...item, quantity: 1 }];
      }

      return current.map((entry, index) =>
        index === matchIndex
          ? { ...entry, quantity: entry.quantity + 1 }
          : entry,
      );
    });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: string, quantity: number) => {
      setItems((current) => {
        if (quantity < 1) {
          return current.filter((entry) => !matchesItem(entry, productId, size));
        }

        return current.map((entry) =>
          matchesItem(entry, productId, size)
            ? { ...entry, quantity }
            : entry,
        );
      });
    },
    [],
  );

  const removeItem = useCallback((productId: string, size: string) => {
    setItems((current) =>
      current.filter((entry) => !matchesItem(entry, productId, size)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CART_STORAGE_KEY, "[]");
    }
  }, []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return {
      items,
      itemCount,
      subtotal,
      isOpen,
      isReady: hydrated,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      openCart,
      closeCart,
    };
  }, [
    addToCart,
    clearCart,
    closeCart,
    hydrated,
    isOpen,
    items,
    openCart,
    removeItem,
    updateQuantity,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
