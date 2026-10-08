"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Check, ChevronDown, ImagePlus, Upload, X } from "lucide-react";
import {
  COLOUR_CHOICES,
  GARMENT_CHOICES,
  IMAGE_INPUT_ACCEPT,
  MAX_IMAGE_BYTES,
  SIZE_CHOICES,
} from "@/data/custom-order";

const fieldClassName =
  "w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 hover:bg-zinc-900 focus:border-[#E29D62] focus:ring-1 focus:ring-[#E29D62]";

const selectClassName = `${fieldClassName} appearance-none pr-10`;

function fileError(file: File) {
  if (file.size > MAX_IMAGE_BYTES) {
    return "Reference image must be 8MB or smaller.";
  }

  const name = file.name.toLowerCase();
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"].some(
    (extension) => name.endsWith(extension),
  );

  if (!allowed) {
    return "Please upload a .jpg, .png, .webp, or .heic image.";
  }

  return null;
}

function canPreview(file: File) {
  return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
}

export function CustomOrder() {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!file || !canPreview(file)) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function assignFile(nextFile: File | null) {
    if (!nextFile) {
      setFile(null);
      setError(null);
      return;
    }

    const message = fileError(nextFile);
    if (message) {
      setError(message);
      return;
    }

    setError(null);
    setFile(nextFile);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const imageInput = form.elements.namedItem("image");
    if (imageInput instanceof HTMLInputElement) {
      const transfer = new DataTransfer();
      if (file) transfer.items.add(file);
      imageInput.files = transfer.files;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/custom-request", {
        method: "POST",
        body: new FormData(form),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to send your request just now.");
      }

      form.reset();
      setFile(null);
      setIsSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to send your request just now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="custom" className="mt-10 scroll-mt-28">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Custom Orders & Colour Options
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
          Our featured collection is hand-painted on classic black. Looking for a
          custom artwork design or a different base shade? Fill out the form
          below and we will get back to you within 24 hours!
        </p>

        {isSuccess ? (
          <div
            className="mt-8 rounded-2xl border border-[#E29D62]/40 bg-zinc-900 px-5 py-8 text-center"
            role="status"
          >
            <Check
              className="mx-auto h-8 w-8 text-[#E29D62]"
              strokeWidth={2.5}
              aria-hidden
            />
            <p className="mt-3 text-lg font-semibold text-white">
              ✨ Request Received! We&apos;ll review your design ideas and reply
              soon.
            </p>
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="mt-5 inline-flex h-11 items-center rounded-full border border-zinc-700 px-5 text-sm font-semibold text-zinc-200 transition-colors hover:border-[#E29D62] hover:text-[#E29D62]"
            >
              Send another request
            </button>
          </div>
        ) : (
          <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor={`${inputId}-company`}>
              Company
            </label>
            <input
              id={`${inputId}-company`}
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-zinc-300">
                Full Name
                <input
                  name="fullName"
                  type="text"
                  required
                  maxLength={120}
                  autoComplete="name"
                  className={fieldClassName}
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-zinc-300">
                Email or Instagram Handle
                <input
                  name="contact"
                  type="text"
                  required
                  maxLength={120}
                  autoComplete="email"
                  placeholder="you@email.com or @handle"
                  className={fieldClassName}
                />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-zinc-300">
                Garment Choice
                <div className="relative">
                  <select
                    name="garment"
                    required
                    defaultValue=""
                    className={selectClassName}
                  >
                    <option value="" disabled>
                      Select a garment
                    </option>
                    {GARMENT_CHOICES.map((choice) => (
                      <option key={choice} value={choice}>
                        {choice}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                </div>
              </label>

              <label className="grid gap-2 text-sm font-medium text-zinc-300">
                Preferred Size
                <div className="relative">
                  <select
                    name="size"
                    required
                    defaultValue=""
                    className={selectClassName}
                  >
                    <option value="" disabled>
                      Select a size
                    </option>
                    {SIZE_CHOICES.map((choice) => (
                      <option key={choice} value={choice}>
                        {choice}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                </div>
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-zinc-300">
              Garment Base Colour
              <div className="relative">
                <select
                  name="colour"
                  required
                  defaultValue=""
                  className={selectClassName}
                >
                  <option value="" disabled>
                    Select a colour
                  </option>
                  {COLOUR_CHOICES.map((choice) => (
                    <option key={choice} value={choice}>
                      {choice}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              </div>
            </label>

            <label className="grid gap-2 text-sm font-medium text-zinc-300">
              Design Idea / Notes
              <textarea
                name="notes"
                rows={5}
                maxLength={4000}
                placeholder="Describe the artwork, placement, and style you have in mind."
                className={`min-h-32 ${fieldClassName}`}
              />
            </label>

            <div className="grid gap-2">
              <p className="text-sm font-medium text-zinc-300">
                Upload Reference Image / Sketch
              </p>
              <label
                htmlFor={`${inputId}-image`}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  if (event.currentTarget.contains(event.relatedTarget as Node)) {
                    return;
                  }
                  setIsDragging(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  const dropped = event.dataTransfer.files[0];
                  if (dropped) assignFile(dropped);
                }}
                className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-6 text-center transition-colors ${
                  isDragging
                    ? "border-rust bg-rust/15"
                    : "border-zinc-700 bg-zinc-950 hover:border-zinc-500"
                }`}
              >
                <input
                  ref={fileInputRef}
                  id={`${inputId}-image`}
                  name="image"
                  type="file"
                  accept={IMAGE_INPUT_ACCEPT}
                  className="sr-only"
                  onChange={(event) => {
                    assignFile(event.target.files?.[0] ?? null);
                    event.currentTarget.value = "";
                  }}
                />

                {file ? (
                  <div className="flex w-full max-w-sm flex-col items-center gap-3">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={`Preview of ${file.name}`}
                        className="max-h-48 w-auto rounded-xl object-contain"
                      />
                    ) : (
                      <ImagePlus className="h-10 w-10 text-zinc-500" />
                    )}
                    <p className="text-sm font-medium text-zinc-200">{file.name}</p>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        assignFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="inline-flex h-9 items-center gap-1 rounded-full border border-zinc-700 px-3 text-xs font-semibold text-zinc-300 hover:border-[#E29D62] hover:text-[#E29D62]"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-zinc-500" />
                    <p className="mt-3 text-sm font-medium text-zinc-200">
                      Drop an image here, or tap to browse
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      JPG, PNG, WEBP, or HEIC · up to 8MB
                    </p>
                  </>
                )}
              </label>
            </div>

            {error ? (
              <p className="text-sm font-medium text-red-400" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-full bg-rust text-sm font-semibold text-rust-ink transition-colors hover:bg-rust-hover disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 sm:w-fit sm:px-8"
            >
              {isSubmitting ? "Sending…" : "Submit Custom Request"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
