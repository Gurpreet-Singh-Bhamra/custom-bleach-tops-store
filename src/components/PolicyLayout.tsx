import Link from "next/link";
import type { ReactNode } from "react";

type PolicyLayoutProps = {
  title: string;
  children: ReactNode;
};

export function PolicyLayout({ title, children }: PolicyLayoutProps) {
  return (
    <main className="flex-1 bg-[#0F0F11]">
      <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
          Policies
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        <div className="mt-8 space-y-8">{children}</div>
        <Link
          href="/"
          className="mt-10 inline-flex h-12 w-fit items-center rounded-full bg-rust px-6 text-sm font-semibold text-rust-ink transition-colors hover:bg-rust-hover"
        >
          Return to shop
        </Link>
      </article>
    </main>
  );
}

export function PolicySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-6 text-zinc-400 sm:text-base">
        {children}
      </div>
    </section>
  );
}
