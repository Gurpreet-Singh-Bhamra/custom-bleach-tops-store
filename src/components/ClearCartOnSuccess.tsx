"use client";

import { useEffect } from "react";
import { useCart } from "./CartProvider";

export function ClearCartOnSuccess() {
  const { clearCart, closeCart, isReady } = useCart();

  useEffect(() => {
    if (!isReady) return;
    clearCart();
    closeCart();
  }, [clearCart, closeCart, isReady]);

  return null;
}
