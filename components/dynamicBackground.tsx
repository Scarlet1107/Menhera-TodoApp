// components/DynamicBackground.tsx
"use client";

import { useTheme } from "next-themes";
import Image from "next/image";

export default function DynamicBackground() {
  const { theme } = useTheme();
  return (
    <div className="fixed inset-0 -z-10">
      <Image
        src={theme === 'dark' ? '/background/night.png' : '/background/noon.png'}
        alt="背景画像"
        fill
        priority
        sizes="100vw"
        className="object-cover select-none pointer-events-none"
      />
    </div>
  );
}
