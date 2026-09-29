"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { ProductGallery } from "./ProductGallery";
import type { Product, Size } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
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
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="relative">
        <ProductGallery images={product.images} alt={product.title} />
        <span
          className={`pointer-events-none absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-xs font-semibold ${
            product.inStock
              ? "bg-emerald-100 text-emerald-800"
              : "bg-stone-800 text-stone-100"
          }`}
        >
          {product.inStock ? "In stock" : "Sold out"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold leading-snug text-stone-900">
            {product.title}
          </h2>
          <p className="shrink-0 text-base font-medium text-stone-700">
            ${product.price}
          </p>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-xs font-medium uppercase tracking-wider text-stone-500">
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
                      ? "border-stone-950 bg-stone-950 text-white"
                      : "border-stone-300 bg-white text-stone-800 hover:border-stone-500"
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
          className="mt-auto h-12 w-full rounded-full bg-stone-950 text-sm font-semibold text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
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
