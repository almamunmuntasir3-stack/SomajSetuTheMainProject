"use client";

import { useState } from "react";
import Image from "next/image";

import { FALLBACK_IMAGE, getImageProps } from "@/src/lib/eventImages";

/**
 * next/image wrapper that never leaves a broken image or empty box behind.
 * Empty/invalid sources use the bundled fallback, and a runtime load failure
 * swaps to the same fallback. Pass `key={src}` where the source can change so
 * the error state resets with the new image.
 */
export default function SafeImage({
  src,
  alt,
  fallbackSrc = FALLBACK_IMAGE,
  ...imageProps
}) {
  const [failed, setFailed] = useState(false);
  const source = failed ? { src: fallbackSrc } : getImageProps(src || fallbackSrc);

  return (
    <Image
      {...imageProps}
      {...source}
      alt={alt}
      onError={() => setFailed(true)}
    />
  );
}
