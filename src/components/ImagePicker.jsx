"use client";

import { Check, ImagePlus } from "lucide-react";

import FieldError from "@/src/components/FieldError";
import SafeImage from "@/src/components/SafeImage";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  FALLBACK_IMAGE,
  IMAGE_PRESETS,
  isValidImageSource,
} from "@/src/lib/eventImages";
import { cn } from "@/src/lib/utils";

/**
 * Controlled cover picker shared by event creation and editing.
 * `value` is the raw stored URL ("" means "no image" -> use the fallback).
 */
export default function ImagePicker({
  value = "",
  onChange,
  idPrefix = "event-image",
  disabled = false,
  error,
}) {
  const selected = String(value ?? "").trim();
  const previewSrc = selected || FALLBACK_IMAGE;
  const canPreview = isValidImageSource(previewSrc);
  const inputId = `${idPrefix}-url`;
  const errorId = `${idPrefix}-error`;

  return (
    <div className="space-y-3">
      <Label>Event image</Label>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <button
          type="button"
          onClick={() => onChange("")}
          disabled={disabled}
          aria-pressed={!selected}
          className={cn(
            "relative overflow-hidden rounded-xl border-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
            !selected ? "border-primary" : "border-line hover:border-primary/60"
          )}
        >
          <SafeImage
            src={FALLBACK_IMAGE}
            alt="Default event cover"
            width={160}
            height={90}
            className="h-16 w-full object-cover"
          />
          <span className="block truncate px-2 py-1.5 text-xs font-medium text-foreground">
            Default cover
          </span>
          {!selected ? (
            <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[var(--primary-foreground)]">
              <Check className="h-3 w-3" aria-hidden="true" />
            </span>
          ) : null}
        </button>

        {IMAGE_PRESETS.map((preset) => {
          const isSelected = selected === preset.url;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange(preset.url)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={cn(
                "relative overflow-hidden rounded-xl border-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                isSelected ? "border-primary" : "border-line hover:border-primary/60"
              )}
            >
              <SafeImage
                src={preset.url}
                alt={preset.label}
                width={160}
                height={90}
                className="h-16 w-full object-cover"
              />
              <span className="block truncate px-2 py-1.5 text-xs font-medium text-foreground">
                {preset.label}
              </span>
              {isSelected ? (
                <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[var(--primary-foreground)]">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <Label htmlFor={inputId}>Or paste an image URL</Label>
        <div className="relative">
          <ImagePlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <Input
            id={inputId}
            type="url"
            value={selected}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="pl-9"
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
          />
        </div>
        <FieldError id={errorId}>{error}</FieldError>
      </div>

      <div className="rounded-xl border border-line bg-surface-muted p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Live preview
          </p>
          <p className="truncate text-xs text-muted">
            {selected ? "Selected cover" : "Default cover — nothing selected"}
          </p>
        </div>
        <div className="relative h-40 overflow-hidden rounded-lg bg-surface sm:h-48">
          {canPreview ? (
            <SafeImage
              key={previewSrc}
              src={previewSrc}
              alt={selected ? "Preview of the selected event cover" : "Default event cover"}
              fill
              sizes="(min-width: 1024px) 30vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted">
              Enter a complete http(s) image URL to preview it here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
