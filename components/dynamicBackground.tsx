// components/DynamicBackground.tsx
"use client";

import Image from "next/image";

export default function DynamicBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Light */}
      <Image
        src="/background/noon.png"
        alt="背景画像"
        fill
        priority
        sizes="100vw"
        className="object-cover block dark:hidden select-none pointer-events-none"
      />
      {/* Dark */}
      <Image
        src="/background/night.png"
        alt="背景画像"
        fill
        priority
        sizes="100vw"
        className="object-cover hidden dark:block select-none pointer-events-none"
      />
    </div>
  );
}
