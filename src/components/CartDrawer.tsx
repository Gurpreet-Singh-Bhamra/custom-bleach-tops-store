"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { formatPrice } from "@/lib/money";
import { useCart } from "./CartProvider";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    isOpen,
    updateQuantity,
    removeItem,
    closeCart,
  } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const frame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCart();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeCart, isOpen]);

  useEffect(() => {
    if (isOpen) setCheckoutError(null);
  }, [isOpen, items]);

  async function handleCheckout() {
    if (items.length === 0 || isCheckingOut) return;

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            title: item.title,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        }),
      });

      const payload = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Unable to start checkout");
      }

      window.location.assign(payload.url);
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Unable to start checkout",
      );
      setIsCheckingOut(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[60] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className={`absolute inset-0 bg-stone-950/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={panelRef}
        id="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute inset-y-0 right-0 flex h-full w-[calc(100%-2.75rem)] max-w-md flex-col bg-white text-stone-950 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-4 sm:px-5">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              Your cart
            </h2>
            <p className="text-sm text-stone-500">
              {itemCount === 0
                ? "No items yet"
                : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 transition-colors hover:border-stone-400"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-base font-medium text-stone-800">
              Your cart is empty
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Add a bleach top to see it here.
            </p>
            <button
              type="button"
              onClick={closeCart}
              className="mt-6 h-11 rounded-full bg-stone-950 px-5 text-sm font-semibold text-white"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <ul className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
            {items.map((item) => {
              const lineTotal = item.price * item.quantity;

              return (
                <li
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-3 border-b border-stone-100 pb-4 last:border-b-0"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.title}</p>
                        <p className="mt-0.5 text-sm text-stone-500">
                          Size {item.size}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold">
                        {formatPrice(lineTotal)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-full border border-stone-200">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity - 1,
                            )
                          }
                          disabled={item.quantity <= 1}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-l-full disabled:opacity-40"
                          aria-label={`Decrease quantity of ${item.title} size ${item.size}`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span
                          className="min-w-6 text-center text-sm font-medium"
                          aria-live="polite"
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity + 1,
                            )
                          }
                          className="inline-flex h-10 w-10 items-center justify-center rounded-r-full"
                          aria-label={`Increase quantity of ${item.title} size ${item.size}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.size)}
                        className="inline-flex h-10 items-center gap-1.5 rounded-full px-2 text-sm text-stone-500 transition-colors hover:text-red-600"
                        aria-label={`Remove ${item.title} size ${item.size} from cart`}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t border-stone-200 px-4 py-4 sm:px-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-stone-500">Subtotal</span>
            <span className="text-lg font-semibold">{formatPrice(subtotal)}</span>
          </div>
          {checkoutError ? (
            <p className="mb-3 text-sm text-red-600" role="alert">
              {checkoutError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={items.length === 0 || isCheckingOut}
            className="h-12 w-full rounded-full bg-stone-950 text-sm font-semibold text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
          >
            {isCheckingOut ? "Redirecting to Stripe…" : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}
