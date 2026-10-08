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
      className="mt-12 scroll-mt-28 border-t border-stone-300/70 pt-10 sm:mt-16"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
        Behind the craft
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-stone-950 sm:text-3xl">
        Drawn in bleach, not printed
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
        The clips show the hand in motion. Close-ups catch the rust lines, wing
        veins, and the way the jersey halo-blooms where the bleach sits
        longest. No two pieces oxidize the same.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-stone-950">
        <ProcessVideo clips={clips} />
      </div>

      <ul className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
        {craftStills.map((still) => (
          <li
            key={still.src}
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
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
            <p className="px-2 py-2 text-[11px] font-medium uppercase tracking-wider text-stone-500 sm:px-3 sm:text-xs">
              {still.caption}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
