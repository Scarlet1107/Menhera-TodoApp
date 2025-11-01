"use client";
import Image from "next/image";
import type { HeraMood } from "@/lib/state";
import { useHera } from "@/lib/hera/context";

// アイコン用のムード→画像マッピング
const moodToIcon: Record<HeraMood, { src: string; alt: string }> = {
  最高: {
    src: "/hera-chan/icon/excellent.png",
    alt: "最高のヘラちゃんアイコン",
  },
  良い: { src: "/hera-chan/icon/good.png", alt: "良いヘラちゃんアイコン" },
  普通: { src: "/hera-chan/icon/neutral.png", alt: "普通のヘラちゃんアイコン" },
  悪い: { src: "/hera-chan/icon/bad.png", alt: "悪いヘラちゃんアイコン" },
  非常に悪い: {
    src: "/hera-chan/icon/very-bad.png",
    alt: "とても悪いヘラちゃんアイコン",
  },
};

type HeraIconImageProps = {
  /** アイコンの幅 (px) */
  width?: number;
  /** アイコンの高さ (px) */
  height?: number;
};

/**
 * 好感度に応じたヘラちゃんアイコンを表示するコンポーネント
 */
export default function HeraIconImage({ }: HeraIconImageProps) {
  const { mood } = useHera();
  const { src, alt } = moodToIcon[mood];

  return (
    <div className="shrink-0">
      <Image
        src={src}
        alt={alt}
        width={72}
        height={72}
        className="rounded-full"
      />
    </div>
  );
}
