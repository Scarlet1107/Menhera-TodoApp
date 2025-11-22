"use client";

import Image from "next/image";
import { HeraAppearance } from "@/lib/context/hera";
import { cn } from "@/lib/utils";

type HeraPreviewProps = {
  appearance: HeraAppearance;
  moodKey?: string;
  className?: string;
  sizes?: string;
};

export function HeraPreview({
  appearance,
  moodKey = "neutral",
  className,
  sizes = "200px",
}: HeraPreviewProps) {
  const baseUrl = "/hera-chan/main/layer";
  const overlayImages = [
    { src: `${baseUrl}/back-hair/${appearance.backHairKey || "default"}.png`, alt: "後ろ髪" },
    { src: `${baseUrl}/clothes/${appearance.clothesKey || "default"}.png`, alt: "服" },
    { src: `${baseUrl}/front-hair-shadow/${appearance.frontHairKey || "default"}.png`, alt: "前髪の影" },
    ...(moodKey === "very-bad"
      ? [{ src: `${baseUrl}/pale/pale-on.png`, alt: "青白さ" }]
      : []),
    { src: `${baseUrl}/front-hair/${appearance.frontHairKey || "default"}.png`, alt: "前髪" },
    { src: `${baseUrl}/expression/${moodKey || "neutral"}.png`, alt: "表情" },
  ];

  return (
    <div
      className={cn(
        "relative h-64 w-full max-w-xs select-none overflow-hidden rounded-3xl bg-linear-to-b from-white to-pink-50 shadow-inner",
        className
      )}
    >
      {overlayImages.map((image) => (
        <Image
          key={image.alt}
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          className="object-contain"
          priority
        />
      ))}
    </div>
  );
}
