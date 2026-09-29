"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { craftStills, processVideo, type ProcessClip } from "@/data/media";

type ProcessVideoProps = {
  clips?: ProcessClip[];
};

export function ProcessVideo({ clips = [] }: ProcessVideoProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const still = craftStills[activeIndex];

  useEffect(() => {
    if (clips.length > 0 || !isPlaying) return;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % craftStills.length);
    }, 2800);

    return () => window.clearInterval(timer);
  }, [clips.length, isPlaying]);

  if (clips.length > 0) {
    return (
      <div
        className={`grid h-full w-full gap-3 ${
          clips.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {clips.map((clip) => (
          <figure key={clip.src} className="overflow-hidden bg-stone-950">
            <video
              className="aspect-[9/16] h-auto w-full object-cover"
              controls
              playsInline
              preload="metadata"
              poster={clip.poster}
              width={720}
              height={1280}
            >
              <source src={clip.src} type="video/mp4" />
              <track
                kind="captions"
                srcLang="en"
                src={processVideo.captions}
                label="English"
                default
              />
              Your browser does not support the video tag.
            </video>
            <figcaption className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-stone-300">
              {clip.label}
            </figcaption>
          </figure>
        ))}
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden bg-stone-950">
      {craftStills.map((frame, index) => (
        <Image
          key={frame.src}
          src={frame.src}
          alt={frame.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-opacity duration-500 ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-stone-950/80 to-transparent px-4 py-3 text-white">
        <button
          type="button"
          onClick={() => setIsPlaying((playing) => !playing)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15"
          aria-label={isPlaying ? "Pause process clip" : "Play process clip"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
        <p className="text-sm font-medium">{still.caption}</p>
      </div>
    </div>
  );
}
