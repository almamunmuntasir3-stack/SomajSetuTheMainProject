/**
 * Shared image helpers for event covers and avatars.
 *
 * Keeping these rules in one place prevents the two classic "every event has
 * the same photo" bugs: silently replacing an unrecognised URL with a fallback,
 * and sending a preset as the default so every new event stores that preset.
 */

// All built-in imagery is bundled in /public/images so it cannot be blocked,
// rate-limited, or 404 when a remote host is unavailable. Each file was
// downloaded from a verified Unsplash response and is a real JPEG.
export const FALLBACK_IMAGE = "/images/event-default.jpg";
export const AVATAR_FALLBACK = "/images/avatar-default.jpg";
export const HERO_IMAGE = "/images/hero-community.jpg";

export const GALLERY_IMAGES = [
  {
    src: "/images/gallery-planting.jpg",
    alt: "Volunteers planting young trees in a community park",
  },
  {
    src: "/images/gallery-cleanup.jpg",
    alt: "Community members cleaning a riverbank together",
  },
  {
    src: "/images/gallery-learning.jpg",
    alt: "Students learning together in a community education session",
  },
  {
    src: "/images/gallery-health.jpg",
    alt: "Medical volunteers providing care at a community health camp",
  },
];

// Deliberately different from every entry in IMAGE_PRESETS. If a preset and
// the fallback share a source, a rejected image is indistinguishable from a
// real selection and all affected events render the same picture.
export const IMAGE_PRESETS = [
  { label: "River cleanup", url: "/images/event-river.jpg" },
  { label: "Tree plantation", url: "/images/event-tree.jpg" },
  { label: "Health camp", url: "/images/event-health.jpg" },
  { label: "Learning circle", url: "/images/event-learning.jpg" },
];

// Must stay in sync with images.remotePatterns in next.config.js. Hosts that
// are not listed here are rendered with `unoptimized` so a pasted URL still
// works instead of being coerced into the fallback image.
const OPTIMIZED_HOSTS = new Set([
  "images.unsplash.com",
  "plus.unsplash.com",
  "images.pexels.com",
  "i.imgur.com",
  "res.cloudinary.com",
]);

const IMAGE_KEYS = [
  "imageUrl",
  "imageURL",
  "image_url",
  "image",
  "coverImage",
  "cover",
  "coverPhoto",
  "thumbnail",
  "thumb",
  "photo",
  "picture",
  "heroImage",
  "featuredImage",
  "imgUrl",
];

/** True for a local path or an absolute http(s) URL. Never crashes on input. */
export function isValidImageSource(value) {
  const candidate = String(value ?? "").trim();
  if (!candidate) return false;
  if (candidate.startsWith("/") && !candidate.startsWith("//")) return true;

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Returns the caller's URL unchanged when usable, and the fallback ONLY when
 * there is nothing usable. Preserving the original URL is what keeps covers
 * distinct for every event.
 */
export function safeImageUrl(value) {
  const candidate = typeof value === "string" ? value.trim() : "";
  return isValidImageSource(candidate) ? candidate : FALLBACK_IMAGE;
}

/** Reads an image from the field-name variants used by the Express backend. */
export function extractImageUrl(source) {
  if (!source || typeof source !== "object") return "";

  for (const key of IMAGE_KEYS) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) return value.trim();

    // Some APIs return `image: { url: "..." }` instead of a plain string.
    if (value && typeof value === "object") {
      const nested =
        (typeof value.url === "string" && value.url) ||
        (typeof value.src === "string" && value.src) ||
        (typeof value.imageUrl === "string" && value.imageUrl);
      if (nested && String(nested).trim()) return String(nested).trim();
    }
  }

  return "";
}

/**
 * Props for next/image. Remote hosts outside our allowlist (and plain http
 * URLs) are passed straight through with `unoptimized` instead of being
 * rejected by the Image Optimization API.
 */
export function getImageProps(value) {
  const src = safeImageUrl(value);
  const props = { src };

  if (src.startsWith("/") && !src.startsWith("//")) return props;

  try {
    const url = new URL(src);
    if (url.protocol !== "https:" || !OPTIMIZED_HOSTS.has(url.hostname.toLowerCase())) {
      props.unoptimized = true;
    }
  } catch {
    props.unoptimized = true;
  }

  return props;
}
