"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { getHeraMood, getShakeIntensity, HeraMood } from "@/lib/state";
import { useHera } from "@/lib/hera/context";

interface HeraMessageProps {
  delay?: number;
  shakeIntensity?: number; // 1〜10くらいまでいけるように
}

const moodColorMap: Record<HeraMood, string> = {
  最高: "bg-pink-50 dark:bg-pink-500",
  良い: "bg-pink-100 dark:bg-pink-700",
  普通: "bg-stone-100 dark:bg-stone-700",
  悪い: "bg-stone-200 dark:bg-stone-800",
  非常に悪い: "bg-red-700 dark:bg-red-800",
};

const moodShadowMap: Record<HeraMood, string> = {
  最高: "shadow-pink-100 dark:shadow-pink-800",
  良い: "shadow-pink-50  dark:shadow-pink-700",
  普通: "shadow-stone-100 dark:shadow-stone-700",
  悪い: "shadow-stone-200 dark:shadow-stone-900",
  非常に悪い: "shadow-black/20 dark:shadow-white/20",
};

const moodFontMap: Record<HeraMood, string> = {
  最高: "font-happy",
  良い: "font-happy",
  普通: "font-sans",
  悪い: "font-angry",
  非常に悪い: "font-creepy",
};

const HeraMessage: React.FC<HeraMessageProps> = ({ delay = 80 }) => {
  const { affection, message } = useHera();
  const [displayedText, setDisplayedText] = useState("");
  const controls = useAnimation();
  const shakeIntensity = getShakeIntensity(affection);

  const mood = getHeraMood(affection);
  const background = moodColorMap[mood];
  const shadow = moodShadowMap[mood];
  const font = moodFontMap[mood];

  const intensity = Math.max(0, Math.min(shakeIntensity, 10));
  const offset = intensity * 0.2; // 揺れの強さを調整できる

  useEffect(() => {
    setDisplayedText("");
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex >= message.length) {
        clearInterval(interval);
        return;
      }

      const char = message.charAt(currentIndex);
      setDisplayedText((prev) => prev + char);
      if (shakeIntensity > 0) {
        controls.start({
          x: [0, -offset, offset, -offset / 2, offset / 2, 0],
          y: [0, offset / 1.5, -offset / 1.5, offset, -offset, 0],
          transition: { duration: 0.25, ease: "easeInOut" },
        });
      }

      currentIndex += 1;
    }, delay);

    return () => clearInterval(interval);
  }, [message, delay]);

  return (
    <div
      className={`p-4 rounded-xl md:text-lg whitespace-pre-wrap transition-all duration-300 ${background} ${shadow} ${font} shadow-md`}
    >
      <motion.span animate={controls} className="inline-block">
        {displayedText}
      </motion.span>
    </div>
  );
};

export default HeraMessage;
