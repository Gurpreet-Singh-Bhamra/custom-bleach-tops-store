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
    <section className="relative isolate min-h-[88vh] overflow-hidden bg-stone-950 text-white sm:min-h-[82vh]">
      {videoSrc ? (
        <video
          className="absolute inset-0 h-full w-full origin-[48%_88%] scale-[2.05] object-cover object-[center_96%] md:inset-y-0 md:left-auto md:w-[56%] md:origin-[62%_84%] md:scale-[1.62] md:object-[70%_100%]"
          autoPlay
          loop
          muted
          playsInline
          controls={false}
          poster={heroSlides[0].src}
          preload="metadata"
          width={540}
          height={960}
          aria-label="Hand drawing a bleach design onto a black camisole"
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

      <div
        className={
          videoSrc
            ? "absolute inset-0 bg-gradient-to-b from-stone-950/75 via-stone-950/25 to-transparent md:right-auto md:w-1/2 md:bg-gradient-to-r md:from-stone-950 md:via-stone-950/70 md:to-transparent"
            : "absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-stone-950/20"
        }
      />

      <div
        className={`relative mx-auto grid min-h-[88vh] max-w-6xl px-4 pb-10 pt-24 sm:min-h-[82vh] sm:px-6 sm:pb-14 ${
          videoSrc ? "md:grid-cols-2 md:items-center md:pt-20" : ""
        }`}
      >
        <div
          className={`flex max-w-xl flex-col ${
            videoSrc ? "justify-start md:justify-center md:pr-8" : "justify-end"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rust">
            1-of-1 handmade pieces
          </p>
          <h1 className="mt-3 max-w-xl text-[2rem] font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Custom Bleach Art You Can Wear
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-stone-200 sm:text-base">
            Hand-painted directly onto dark cotton tops. Pick from our signature
            art or request a 100% custom design—no two pieces are ever
            identical.
          </p>
          <a
            href="#shop"
            className="mt-6 inline-flex h-12 w-fit items-center rounded-full bg-rust px-6 text-sm font-semibold text-rust-ink transition-colors hover:bg-rust-hover"
          >
            Shop Collection
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
                      ? "w-8 bg-rust"
                      : "w-4 bg-white/40"
                  }`}
                  aria-label={`Show ${slide.alt}`}
                />
              ))}
            </div>
          )}
          <span className="sr-only">{current.alt}</span>
        </div>
        {videoSrc ? <div className="hidden md:block" aria-hidden /> : null}
      </div>
    </section>
  );
}
