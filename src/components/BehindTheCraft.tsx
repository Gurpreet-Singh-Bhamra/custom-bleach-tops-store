import Image from "next/image";
import { craftStills, type ProcessClip } from "@/data/media";
import { ProcessVideo } from "./ProcessVideo";

type BehindTheCraftProps = {
  clips?: ProcessClip[];
};

export function BehindTheCraft({ clips = [] }: BehindTheCraftProps) {
  return (
    <section
      id="craft"
      className="mt-12 scroll-mt-28 border-t border-zinc-800 pt-10 sm:mt-16"
    >
      <h2 className="text-2xl font-bold text-white sm:text-3xl">
        Behind the craft
      </h2>
      <p className="mt-2 text-sm font-medium text-zinc-400 sm:text-base">
        Drawn in bleach, not printed
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
        The clips show the hand in motion. Close-ups catch the rust lines, wing
        veins, and the way the jersey halo-blooms where the bleach sits
        longest. No two pieces oxidize the same.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <ProcessVideo clips={clips} />
      </div>

      <ul className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
        {craftStills.map((still) => (
          <li
            key={still.src}
            className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
          >
            <div className="relative aspect-[3/4]">
              <Image
                src={still.src}
                alt={still.alt}
                fill
                sizes="(max-width: 768px) 33vw, 20vw"
                className="object-cover"
              />
            </div>
            <p className="px-2 py-2 font-mono text-xs uppercase tracking-wider text-zinc-200 sm:px-3">
              {still.caption}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
