// components/DynamicBackground.tsx
import Image from "next/image";



export default function DynamicBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none select-none">
      <Image
        src="/background/noon.png"
        alt=""
        fill
        loading="lazy"
        sizes="100vw"
        aria-hidden
        className="object-cover dark:hidden"
      />
      <Image
        src="/background/night.png"
        alt=""
        fill
        loading="lazy"
        fetchPriority="low"
        sizes="100vw"
        aria-hidden
        className="hidden object-cover dark:block"
      />
    </div>
  );
}
