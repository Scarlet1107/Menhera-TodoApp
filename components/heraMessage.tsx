"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { getHeraMood, HeraMood } from "@/lib/state";

interface HeraMessageProps {
  message: string;
  affection?: number;
  delay?: number;
  shakeIntensity?: number; // 1〜10くらいまでいけるように
}

const moodColorMap: Record<HeraMood, string> = {
  最高: "bg-pink-200",
  普通: "bg-neutral-200",
  悪い: "bg-yellow-100",
  非常に悪い: "bg-red-100",
};

const moodShadowMap: Record<HeraMood, string> = {
  最高: "shadow-pink-300",
  普通: "shadow-gray-300",
  悪い: "shadow-yellow-400",
  非常に悪い: "shadow-red-400",
};

const moodFontMap: Record<HeraMood, string> = {
  最高: "font-happy",
  普通: "font-sans",
  悪い: "font-angry",
  非常に悪い: "font-creepy",
};

const HeraMessage: React.FC<HeraMessageProps> = ({
  message,
  affection = 50,
  delay = 100,
  shakeIntensity = 3, // 0から10で設定可能
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const controls = useAnimation();

  const mood = getHeraMood(affection);
  const background = moodColorMap[mood];
  const shadow = moodShadowMap[mood];
  const font = moodFontMap[mood];

  const intensity = Math.max(0, Math.min(shakeIntensity, 10));
  console.log("intensity", intensity);
  const offset = intensity * 0.2; // 揺れの強さを調整できる
  console.log("offset", offset);

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
      className={`p-4 rounded-xl text-lg whitespace-pre-wrap transition-all duration-300 ${background} ${shadow} ${font} shadow-md`}
    >
      <motion.span animate={controls} className="inline-block">
        {displayedText}
      </motion.span>
    </div>
  );
};

export default HeraMessage;
