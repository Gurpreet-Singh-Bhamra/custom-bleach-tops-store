"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { heroSlides } from "@/data/media";

type HeroMediaProps = {
  videoSrc?: string;
};

export function HeroMedia({ videoSrc }: HeroMediaProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = heroSlides[activeIndex];

  useEffect(() => {
    if (videoSrc) return;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % heroSlides.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [videoSrc]);

  return (
    <section className="relative isolate min-h-[72vh] overflow-hidden bg-stone-950 text-white sm:min-h-[78vh]">
      {videoSrc ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={heroSlides[0].src}
          preload="metadata"
          width={1600}
          height={2000}
          aria-label="Lookbook of custom bleach camisoles"
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <Image
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className={`object-cover object-[center_42%] transition-opacity duration-700 ease-out ${
                index === activeIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-stone-950/20" />

      <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-end px-4 pb-10 pt-24 sm:min-h-[78vh] sm:px-6 sm:pb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
          Handmade bleach camisoles
        </p>
        <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
          One-of-one line work on black jersey
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-stone-200 sm:text-base">
          Sea turtles, butterflies, gothic crosses — each top is drawn in
          bleach, then left to rust into its own rust-orange finish.
        </p>
        <a
          href="#shop"
          className="mt-6 inline-flex h-12 w-fit items-center rounded-full bg-amber-300 px-6 text-sm font-semibold text-stone-950"
        >
          Shop the drop
        </a>

        {videoSrc ? null : (
          <div className="mt-8 flex gap-2">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex
                    ? "w-8 bg-amber-300"
                    : "w-4 bg-white/40"
                }`}
                aria-label={`Show ${slide.alt}`}
              />
            ))}
          </div>
        )}
        <span className="sr-only">{current.alt}</span>
      </div>
    </section>
  );
}
