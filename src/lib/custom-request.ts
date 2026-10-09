import {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_TYPES,
  COLOUR_CHOICES,
  GARMENT_CHOICES,
  MAX_IMAGE_BYTES,
  SIZE_CHOICES,
  type ColourChoice,
  type GarmentChoice,
  type SizeChoice,
} from "@/data/custom-order";

export type CustomRequestFields = {
  fullName: string;
  contact: string;
  garment: GarmentChoice;
  size: SizeChoice;
  colour: ColourChoice;
  notes: string;
};

export type CustomRequestImage = {
  filename: string;
  contentType: string;
  bytes: Buffer;
};

export type ParsedCustomRequest = CustomRequestFields & {
  image: CustomRequestImage | null;
  replyTo: string | undefined;
};

class CustomRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomRequestError";
  }
}

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isChoice<T extends readonly string[]>(
  value: string,
  choices: T,
): value is T[number] {
  return choices.includes(value);
}

function extensionOf(filename: string) {
  const match = filename.toLowerCase().match(/(\.[a-z0-9]+)$/);
  return match?.[1] ?? "";
}

function safeFilename(name: string) {
  const base = name.replaceAll("\\", "/").split("/").pop()?.trim() || "reference";
  const cleaned = base.replace(/[^\w.\- ()]/g, "_").slice(0, 120);
  return cleaned || "reference";
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidContact(value: string) {
  if (value.length < 2 || value.length > 120) return false;
  if (/\s/.test(value)) return false;
  if (value.includes("@") && value.includes(".")) {
    return looksLikeEmail(value);
  }

  const handle = value.replace(/^@/, "");
  return /^[A-Za-z0-9._]{2,30}$/.test(handle);
}

function isAllowedImage(file: File) {
  const filename = safeFilename(file.name);
  const extension = extensionOf(filename);
  const type = file.type.toLowerCase();

  const typeOk =
    type === "" ||
    type === "application/octet-stream" ||
    ACCEPTED_IMAGE_TYPES.includes(type as (typeof ACCEPTED_IMAGE_TYPES)[number]);
  const extensionOk = ACCEPTED_IMAGE_EXTENSIONS.includes(
    extension as (typeof ACCEPTED_IMAGE_EXTENSIONS)[number],
  );

  return typeOk && extensionOk;
}

export function isHoneypotFilled(formData: FormData) {
  return asString(formData.get("website_url")).length > 0;
}

export async function parseCustomRequest(
  formData: FormData,
): Promise<ParsedCustomRequest> {
  const fullName = asString(formData.get("fullName"));
  const contact = asString(formData.get("contact"));
  const garment = asString(formData.get("garment"));
  const size = asString(formData.get("size"));
  const colour = asString(formData.get("colour"));
  const notes = asString(formData.get("notes"));
  const imageValue = formData.get("image");

  if (!fullName || fullName.length > 120) {
    throw new CustomRequestError("Please enter your full name.");
  }

  if (!isValidContact(contact)) {
    throw new CustomRequestError(
      "Please enter a valid email address or Instagram handle.",
    );
  }

  if (!isChoice(garment, GARMENT_CHOICES)) {
    throw new CustomRequestError("Please choose a garment.");
  }

  if (!isChoice(size, SIZE_CHOICES)) {
    throw new CustomRequestError("Please choose a preferred size.");
  }

  if (!isChoice(colour, COLOUR_CHOICES)) {
    throw new CustomRequestError("Please choose a garment base colour.");
  }

  if (notes.length > 4000) {
    throw new CustomRequestError("Design notes are too long.");
  }

  let image: CustomRequestImage | null = null;

  if (imageValue instanceof File && imageValue.size > 0) {
    if (imageValue.size > MAX_IMAGE_BYTES) {
      throw new CustomRequestError("Reference image must be 8MB or smaller.");
    }

    if (!isAllowedImage(imageValue)) {
      throw new CustomRequestError(
        "Please upload a .jpg, .png, .webp, or .heic image.",
      );
    }

    image = {
      filename: safeFilename(imageValue.name),
      contentType: imageValue.type || "application/octet-stream",
      bytes: Buffer.from(await imageValue.arrayBuffer()),
    };
  }

  return {
    fullName,
    contact,
    garment,
    size,
    colour,
    notes,
    image,
    replyTo: looksLikeEmail(contact) ? contact : undefined,
  };
}

export function isCustomRequestError(error: unknown): error is CustomRequestError {
  return error instanceof CustomRequestError;
}

export { CustomRequestError };
