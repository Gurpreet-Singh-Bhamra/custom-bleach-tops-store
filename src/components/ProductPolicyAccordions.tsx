"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

function AccordionItem({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  function toggleOpen() {
    setOpen((current) => !current);
  }

  return (
    <div className="border-t border-zinc-800">
      <button
        type="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggleOpen}
        onKeyDown={(event) => {
          if (event.key !== " ") return;
          event.preventDefault();
          toggleOpen();
        }}
        className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium text-zinc-200 transition-colors hover:text-rust"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-300 ${
            open ? "rotate-180 text-rust" : ""
          }`}
          aria-hidden
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div id={panelId} className="min-h-0 overflow-hidden" inert={!open}>
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
            tabIndex={0}
            className="font-medium text-rust transition-colors hover:text-rust-hover"
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
            tabIndex={0}
            className="font-medium text-rust transition-colors hover:text-rust-hover"
          >
            View full returns policy
          </Link>
        </p>
      </AccordionItem>
    </div>
  );
}
