"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK_IMAGE = "/images/pizzas/margherita.jpg";

type MenuItemImageProps = {
  images?: string[];
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

export default function MenuItemImage({
  images,
  alt,
  sizes,
  className,
  priority = false,
}: MenuItemImageProps) {
  const sources = (images || []).filter(Boolean);
  const [index, setIndex] = useState(0);
  const src = index < sources.length ? sources[index] : FALLBACK_IMAGE;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => {
        if (index < sources.length) {
          setIndex(index + 1);
        }
      }}
    />
  );
}
