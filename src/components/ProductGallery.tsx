"use client";

import Image from "next/image";
import { useState } from "react";

type ProductGalleryProps = {
  images: string[];
  alt: string;
  priority?: boolean;
};

export function ProductGallery({
  images,
  alt,
  priority = false,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = images.length > 0 ? images : [];

  function showNext() {
    setActiveIndex((index) => (index + 1) % slides.length);
  }

  if (slides.length === 0) return null;

  return (
    <div className="relative aspect-[4/5] bg-stone-100">
      <button
        type="button"
        onClick={showNext}
        className="absolute inset-0"
        aria-label={`View next photo of ${alt}`}
      >
        {slides.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={index === activeIndex ? alt : ""}
            fill
            priority={priority && index === 0}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover object-[center_12%] transition-opacity duration-300 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </button>

      {slides.length > 1 ? (
        <div className="pointer-events-auto absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
          {slides.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex(index);
              }}
              className={`h-2 rounded-full ${
                index === activeIndex
                  ? "w-5 bg-white"
                  : "w-2 bg-white/60"
              }`}
              aria-label={`Show photo ${index + 1} of ${slides.length}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
