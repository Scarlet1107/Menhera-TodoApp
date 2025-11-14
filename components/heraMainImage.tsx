"use client";
import Image from "next/image";
import { useState } from "react";
import type { HeraMood } from "@/lib/state";
import { useHera } from "@/lib/hera/context";

const moodToImage: Record<HeraMood, { src: string; alt: string }> = {
  最高: {
    src: "/hera-chan/main/excellent.png",
    alt: "最高のヘラちゃん",
  },
  良い: {
    src: "/hera-chan/main/good.png",
    alt: "良いヘラちゃん",
  },
  普通: {
    src: "/hera-chan/main/neutral.png",
    alt: "普通のヘラちゃん",
  },
  悪い: { src: "/hera-chan/main/bad.png", alt: "悪いヘラちゃん" },
  非常に悪い: {
    src: "/hera-chan/main/very-bad.png",
    alt: "とても悪いヘラちゃん",
  },
};

/**
 * 好感度からムードを判定し、対応するヘラちゃん画像を表示するコンポーネント
 */
export default function HeraMainImage() {
  const { mood } = useHera();
  const overlayImages = [
    { src: "/variations/1.png", alt: "ヘラちゃんのオーバーレイ" },
    { src: "/variations/2.png", alt: "ヘラちゃんのオーバーレイ" },
    { src: "/variations/3.png", alt: "ヘラちゃんのオーバーレイ" },
    { src: "/variations/4.png", alt: "ヘラちゃんのオーバーレイ" },
    { src: "/variations/5.png", alt: "ヘラちゃんのオーバーレイ" },
    { src: "/variations/6.png", alt: "ヘラちゃんのオーバーレイ" },
  ];

  const [loadedFlags, setLoadedFlags] = useState<Record<number, boolean>>({});
  const handleImageLoad = (index: number) => {
    setLoadedFlags(prev => {
      if (prev[index]) return prev;
      return { ...prev, [index]: true };
    });
  };

  return (
    <div
      className="
    relative left-1/2 bottom-0 transform -translate-x-2/3
    w-[400px] h-[500px]
    sm:w-[420px] sm:h-[520px]
    md:w-[450px] md:h-[550px]
    lg:w-[550px] lg:h-[600px]
    xl:w-[600px] xl:h-[650px]
    2xl:w-[650px] 2xl:h-[700px]
  "
    >
      {overlayImages.map((image, index) => (
        <Image
          key={index}
          src={image.src}
          alt={image.alt}
          fill
          loading="eager"
          sizes="(max-width: 1024px) 70vw, 550px"
          className={`object-contain transition-opacity duration-300 ${loadedFlags[index] ? "opacity-100" : "opacity-0"}`}
          onLoadingComplete={() => handleImageLoad(index)}
        />
      ))}
    </div>
  );
}
