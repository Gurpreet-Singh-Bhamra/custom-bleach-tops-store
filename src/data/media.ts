export const heroSlides = [
  {
    src: "/media/products/turtle-styled-v3.jpg",
    alt: "Sea Turtle bleach cami styled with a silver chain and jeans",
  },
  {
    src: "/media/products/butterfly-back.jpg",
    alt: "Butterfly Bloom bleach tee laid on a wood floor",
  },
  {
    src: "/media/products/web-styled-v3.jpg",
    alt: "Web Portrait bleach cami laid out with a bag and belt",
  },
  {
    src: "/media/products/cross-look-v3.jpg",
    alt: "Gothic Cross bleach cami styled with a studded belt",
  },
  {
    src: "/media/products/bloom-look.jpg",
    alt: "Night Bloom bleach cami on a wood floor with a leather bag",
  },
] as const;

export const craftStills = [
  {
    src: "/media/craft/turtle-detail.jpg",
    alt: "Close-up of hand-bleached turtle shell and flower linework",
    caption: "Line work",
  },
  {
    src: "/media/craft/cross-detail.jpg",
    alt: "Close-up of rust-orange bleach blooming through a gothic cross",
    caption: "Bleach bloom",
  },
  {
    src: "/media/craft/butterfly-detail.jpg",
    alt: "Close-up of a bleach-drawn butterfly on ribbed black jersey",
    caption: "Wing veins",
  },
] as const;

export const processVideo = {
  src: "/media/craft/process-0042.mp4",
  poster: "/media/craft/butterfly-detail.jpg",
} as const;

export type ProcessClip = {
  src: string;
  poster: string;
  label: string;
};
