"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";

const navLinks = [
  { href: "/#shop", label: "Shop" },
  { href: "/#craft", label: "Craft" },
  { href: "/#sizing", label: "Sizing" },
];

export function Header() {
  const { itemCount, isOpen, openCart } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-800/80 bg-stone-950/95 text-stone-50 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="text-[1.05rem] font-semibold tracking-[0.18em] uppercase"
        >
          Bleach Tops
        </Link>

        <button
          type="button"
          id="cart-trigger"
          onClick={openCart}
          aria-expanded={isOpen}
          aria-controls="cart-drawer"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-700 transition-colors hover:border-amber-300 hover:text-amber-200"
          aria-label={`Shopping cart, ${itemCount} items`}
        >
          <ShoppingCart className="h-5 w-5" strokeWidth={1.75} />
          {itemCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-300 px-1 text-[11px] font-semibold text-stone-950">
              {itemCount}
            </span>
          ) : null}
        </button>
      </div>

      <nav
        aria-label="Primary"
        className="border-t border-stone-800/80 bg-stone-950"
      >
        <div className="mx-auto flex h-11 max-w-6xl items-center gap-6 overflow-x-auto px-4 text-sm font-medium tracking-wide sm:px-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 text-stone-300 transition-colors hover:text-amber-200"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
