"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { craftStills, type ProcessClip } from "@/data/media";

type ProcessVideoProps = {
  clips?: ProcessClip[];
};

function StudioClip({ clip }: { clip: ProcessClip }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.playsInline = true;
    void video.play().catch(() => {});
  }, []);

  return (
    <figure className="relative overflow-hidden bg-stone-950">
      <div className="relative aspect-[9/16] w-full">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          controls={false}
          preload="metadata"
          poster={clip.poster}
          width={720}
          height={1280}
          aria-label={clip.label}
        >
          <source src={clip.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/90 via-stone-950/45 to-transparent px-3 pb-3 pt-12">
          <figcaption className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
            {clip.label}
          </figcaption>
        </div>
      </div>
    </figure>
  );
}

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
          <StudioClip key={clip.src} clip={clip} />
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
