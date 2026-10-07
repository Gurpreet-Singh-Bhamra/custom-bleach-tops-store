"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import {
  COLOUR_CHOICES,
  GARMENT_CHOICES,
  IMAGE_INPUT_ACCEPT,
  MAX_IMAGE_BYTES,
  SIZE_CHOICES,
} from "@/data/custom-order";

const fieldClassName =
  "h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-stone-950";

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
    <section id="custom" className="mt-10 scroll-mt-28 pb-8">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
          Custom Orders & Colour Options
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600 sm:text-base">
          Our featured collection is hand-painted on classic black. Looking for a
          custom artwork design or a different base shade? Fill out the form
          below and we will get back to you within 24 hours!
        </p>

        {isSuccess ? (
          <div
            className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-8 text-center"
            role="status"
          >
            <p className="text-lg font-semibold text-stone-950">
              ✨ Request Received! We&apos;ll review your design ideas and reply
              soon.
            </p>
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="mt-5 inline-flex h-11 items-center rounded-full border border-stone-300 px-5 text-sm font-semibold text-stone-800 transition-colors hover:border-stone-950"
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
              <label className="grid gap-2 text-sm font-medium text-stone-800">
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

              <label className="grid gap-2 text-sm font-medium text-stone-800">
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
              <label className="grid gap-2 text-sm font-medium text-stone-800">
                Garment Choice
                <select name="garment" required defaultValue="" className={fieldClassName}>
                  <option value="" disabled>
                    Select a garment
                  </option>
                  {GARMENT_CHOICES.map((choice) => (
                    <option key={choice} value={choice}>
                      {choice}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-stone-800">
                Preferred Size
                <select name="size" required defaultValue="" className={fieldClassName}>
                  <option value="" disabled>
                    Select a size
                  </option>
                  {SIZE_CHOICES.map((choice) => (
                    <option key={choice} value={choice}>
                      {choice}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-stone-800">
              Garment Base Colour
              <select name="colour" required defaultValue="" className={fieldClassName}>
                <option value="" disabled>
                  Select a colour
                </option>
                {COLOUR_CHOICES.map((choice) => (
                  <option key={choice} value={choice}>
                    {choice}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-stone-800">
              Design Idea / Notes
              <textarea
                name="notes"
                rows={5}
                maxLength={4000}
                placeholder="Describe the artwork, placement, and style you have in mind."
                className="min-h-32 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-stone-950"
              />
            </label>

            <div className="grid gap-2">
              <p className="text-sm font-medium text-stone-800">
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
                    ? "border-amber-400 bg-amber-50"
                    : "border-stone-300 bg-stone-50 hover:border-stone-500"
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
                      <ImagePlus className="h-10 w-10 text-stone-500" />
                    )}
                    <p className="text-sm font-medium text-stone-800">{file.name}</p>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        assignFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="inline-flex h-9 items-center gap-1 rounded-full border border-stone-300 px-3 text-xs font-semibold text-stone-700 hover:border-stone-950"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-stone-500" />
                    <p className="mt-3 text-sm font-medium text-stone-800">
                      Drop an image here, or tap to browse
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      JPG, PNG, WEBP, or HEIC · up to 8MB
                    </p>
                  </>
                )}
              </label>
            </div>

            {error ? (
              <p className="text-sm font-medium text-red-700" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-full bg-stone-950 text-sm font-semibold text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300 sm:w-fit sm:px-8"
            >
              {isSubmitting ? "Sending…" : "Submit Custom Request"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
