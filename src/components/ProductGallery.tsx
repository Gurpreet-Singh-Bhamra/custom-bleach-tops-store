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

  if (slides.length === 0) return null;

  return (
    <div className="relative aspect-[4/5] bg-zinc-950">
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

      {slides.length > 1 ? (
        <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
          {slides.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveIndex(index)}
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
