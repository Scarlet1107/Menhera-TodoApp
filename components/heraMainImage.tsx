"use client";
import Image from "next/image";
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

type HeraMainImageProps = {
  /** 画像の幅 (px) */
  width?: number;
  /** 画像の高さ (px) */
  height?: number;
};

/**
 * 好感度からムードを判定し、対応するヘラちゃん画像を表示するコンポーネント
 */
export default function HeraMainImage({
  width = 300,
  height = 400,
}: HeraMainImageProps) {
  const { mood } = useHera();
  const { src, alt } = moodToImage[mood];

  return (
    <div className="absolute bottom-0 left-1/3 transform -translate-x-1/2">
      <Image src={src} alt={alt} width={width} height={height} />
    </div>
  );
}
