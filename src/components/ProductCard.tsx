"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/money";
import { useCart } from "./CartProvider";
import { ProductGallery } from "./ProductGallery";
import type { Product, Size } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, openCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<Size>(product.sizes[0]);
  const [justAdded, setJustAdded] = useState(false);

  function handleAddToCart() {
    if (!product.inStock) return;

    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      size: selectedSize,
      image: product.image,
    });
    openCart();
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60">
      <div className="relative">
        <ProductGallery
          images={product.images}
          alt={product.title}
          priority={product.image === "/media/products/bloom-look.jpg"}
        />
        {product.inStock ? (
          <span className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center rounded-full border border-white/10 bg-black/80 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-md">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            In stock
          </span>
        ) : (
          <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold leading-snug text-white">
            {product.title}
          </h2>
          <p className="shrink-0 text-base font-medium text-zinc-300">
            {formatPrice(product.price)}
          </p>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Size
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => {
              const isSelected = selectedSize === size;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  disabled={!product.inStock}
                  aria-pressed={isSelected}
                  className={`h-10 min-w-10 rounded-full border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected
                      ? "border-[#E29D62] bg-[#E29D62] text-[#0F0F11]"
                      : "border-zinc-700 bg-transparent text-zinc-200 hover:border-zinc-500"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="mt-auto h-12 w-full rounded-full bg-rust text-sm font-semibold text-rust-ink transition-colors hover:bg-rust-hover disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
        >
          {!product.inStock
            ? "Sold out"
            : justAdded
              ? "Added to cart"
              : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
