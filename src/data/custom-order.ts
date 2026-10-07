export const GARMENT_CHOICES = [
  "Cropped Tee",
  "Standard Fit Tee",
  "Oversized Hoodie",
  "Custom / Other",
] as const;

export const SIZE_CHOICES = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "Custom Sizing",
] as const;

export const COLOUR_CHOICES = [
  "Classic Black",
  "Navy Blue",
  "Charcoal Grey",
  "Deep Forest Green",
  "Other / Open to Suggestions",
] as const;

export const ACCEPTED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
] as const;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export const IMAGE_INPUT_ACCEPT = [
  ...ACCEPTED_IMAGE_EXTENSIONS,
  ...ACCEPTED_IMAGE_TYPES,
].join(",");

export type GarmentChoice = (typeof GARMENT_CHOICES)[number];
export type SizeChoice = (typeof SIZE_CHOICES)[number];
export type ColourChoice = (typeof COLOUR_CHOICES)[number];
