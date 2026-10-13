"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

function AccordionItem({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const lastToggleAt = useRef(0);

  function toggle() {
    const now = Date.now();
    if (now - lastToggleAt.current < 50) return;
    lastToggleAt.current = now;
    setIsOpen((prev) => !prev);
  }

  return (
    <div className="border-t border-zinc-800">
      <button
        type="button"
        tabIndex={0}
        aria-expanded={isOpen ? "true" : "false"}
        aria-controls={panelId}
        onClick={() => toggle()}
        onKeyDown={(e) => {
          if (
            e.key === " " ||
            e.key === "Spacebar" ||
            e.key === "Space" ||
            e.key === "Enter"
          ) {
            e.preventDefault();
            toggle();
          }
        }}
        className="relative z-[60] flex w-full scroll-mt-32 items-center justify-between gap-3 py-3 text-left text-sm font-medium text-zinc-200 transition-colors hover:text-rust"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-rust" : ""
          }`}
          aria-hidden
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div id={panelId} className="min-h-0 overflow-hidden" inert={!isOpen}>
          <div className="space-y-2 pb-3 text-xs leading-5 text-zinc-400 sm:text-sm sm:leading-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductPolicyAccordions() {
  return (
    <div className="mt-1">
      <AccordionItem title="Delivery & Shipping">
        <ul className="list-disc space-y-1.5 pl-4">
          <li>UK Standard: £3.99 (3–5 business days via Royal Mail tracked)</li>
          <li>Europe: £9.99 (5–10 business days)</li>
          <li>Rest of World: £14.99 (7–14 business days)</li>
        </ul>
        <p>
          <Link
            href="/shipping"
            className="scroll-mt-32 font-medium text-rust transition-colors hover:text-rust-hover"
          >
            View full delivery policy
          </Link>
        </p>
      </AccordionItem>

      <AccordionItem title="Returns & Care">
        <p>
          14-day return window for standard unworn 1-of-1 pieces (buyer covers
          return postage).
        </p>
        <p>Custom/bespoke orders are non-refundable.</p>
        <p>
          <Link
            href="/returns"
            className="scroll-mt-32 font-medium text-rust transition-colors hover:text-rust-hover"
          >
            View full returns policy
          </Link>
        </p>
      </AccordionItem>
    </div>
  );
}
