"use client";
import Image from "next/image";
import { useState } from "react";
import { useHera } from "@/lib/context/hera";

/**
 * 好感度からムードを判定し、対応するヘラちゃん画像を表示するコンポーネント
 */
export default function HeraMainImage() {
  const { appearance, moodKey } = useHera();
  const baseUrl = "/hera-chan/main/layer";

  const backHairSrc = `${baseUrl}/back-hair/${appearance.backHairKey || "default"}.png`;
  const clothesSrc = `${baseUrl}/clothes/${appearance.clothesKey || "default"}.png`;
  const frontHairShadow = `${baseUrl}/front-hair-shadow/${appearance.frontHairKey || "default"}.png`;
  const pale = moodKey === "very-bad" ? `${baseUrl}/pale/pale-on.png` : null;
  const frontHairSrc = `${baseUrl}/front-hair/${appearance.frontHairKey || "default"}.png`;
  const expressionSrc = `${baseUrl}/expression/${moodKey || "neutral"}.png`;

  const overlayImages = [
    { src: backHairSrc, alt: "後ろ髪" },
    { src: clothesSrc, alt: "服" },
    { src: frontHairShadow, alt: "前髪の影" },
    ...(pale ? [{ src: pale, alt: "青白さ" }] : []),
    { src: frontHairSrc, alt: "前髪" },
    { src: expressionSrc, alt: "表情" },
  ];

  const [loadedFlags, setLoadedFlags] = useState<Record<number, boolean>>({});
  const handleImageLoad = (index: number) => {
    setLoadedFlags(prev => {
      if (prev[index]) return prev;
      return { ...prev, [index]: true };
    });
  };
  const isReady = Object.keys(loadedFlags).length >= overlayImages.length;


  return (
    <div
      className="
    fixed bottom-0 left-1/3 -translate-x-1/2
    z-0 pointer-events-none select-none
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
          className={`object-contain transition-opacity duration-300 ${isReady ? "opacity-100" : "opacity-0"}`}
          onLoad={() => handleImageLoad(index)}
        />
      ))}
    </div>
  );
}
