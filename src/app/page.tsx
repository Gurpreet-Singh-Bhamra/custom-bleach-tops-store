import { existsSync } from "node:fs";
import path from "node:path";
import products from "@/data/products.json";
import { BehindTheCraft } from "@/components/BehindTheCraft";
import { CustomOrder } from "@/components/CustomOrder";
import { HeroMedia } from "@/components/HeroMedia";
import { ProductCard } from "@/components/ProductCard";
import type { ProcessClip } from "@/data/media";
import type { Product } from "@/types/product";

const catalog = products as Product[];

function publicMedia(filePath: string) {
  return existsSync(path.join(process.cwd(), "public", filePath))
    ? `/${filePath}`
    : undefined;
}

export default function Home() {
  const heroVideo = publicMedia("media/hero.mp4")
    ? "/media/hero.mp4?v=5"
    : undefined;
  const clips = [
    publicMedia("media/craft/process-0042.mp4")
      ? {
          src: "/media/craft/process-0042.mp4",
          poster: "/media/craft/butterfly-detail.jpg",
          label: "Process clip",
        }
      : null,
    publicMedia("media/hero.mp4")
      ? {
          src: "/media/hero.mp4?v=5",
          poster: "/media/products/butterfly-back.jpg",
          label: "Studio clip",
        }
      : null,
  ].filter((clip): clip is ProcessClip => clip !== null);

  return (
    <main className="flex-1">
      <HeroMedia videoSrc={heroVideo} />

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section id="shop" className="scroll-mt-28" aria-label="Products">
          <div className="mb-6 sm:mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              This drop
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
              Custom bleach tops
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {catalog.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <BehindTheCraft clips={clips} />

        <section
          id="sizing"
          className="mt-10 scroll-mt-28 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="text-xl font-semibold text-stone-950">Sizing</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600 sm:text-base">
            Available in sizes XXS through XL. Choose your usual size for a
            fitted look, or size up for a more relaxed, oversized fit.
          </p>
        </section>

        <CustomOrder />
      </div>
    </main>
  );
}
