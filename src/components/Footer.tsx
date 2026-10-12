import Link from "next/link";

const policyLinks = [
  { href: "/shipping", label: "Delivery & Shipping" },
  { href: "/returns", label: "Refund & Returns" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-stone-950 text-zinc-400">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Bleach Tops
        </p>
        <nav aria-label="Policies">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {policyLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-zinc-300 transition-colors hover:text-rust"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
