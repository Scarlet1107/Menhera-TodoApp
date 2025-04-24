// components/DynamicBackground.tsx
"use client";

export default function DynamicBackground() {
  return (
    <div
      className="
        fixed inset-0
        bg-[url('/background/noon.png')]
        dark:bg-[url('/background/night.png')]
        bg-center bg-cover bg-no-repeat
        -z-10
      "
    />
  );
}
