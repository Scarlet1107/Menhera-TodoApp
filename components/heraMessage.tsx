"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getHeraMood, HeraMood } from "@/lib/state";

interface HeraMessageProps {
  message: string;
  affection?: number;
  delay?: number;
  shakeIntensity?: number; // 揺れの強さ：1〜5ぐらいで調整
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

const HeraMessage: React.FC<HeraMessageProps> = ({
  message,
  affection = 50,
  delay = 100,
  shakeIntensity = 2,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [shakeKey, setShakeKey] = useState(0);

  const mood = getHeraMood(affection);
  const background = moodColorMap[mood];
  const shadow = moodShadowMap[mood];

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
      setShakeKey(Math.random());
      currentIndex += 1;
    }, delay);

    return () => clearInterval(interval);
  }, [message, delay]);

  const intensity = Math.max(1, Math.min(shakeIntensity, 5)); // clamp
  const offset = intensity * 1.5;

  return (
    <motion.div
      key={shakeKey}
      animate={{
        x: [0, -offset, offset, -offset / 2, offset / 2, 0],
        y: [0, offset / 2, -offset / 2, offset, -offset, 0],
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={`p-4 rounded-xl text-lg font-mono whitespace-pre-wrap transition-all duration-300 ${background} ${shadow} shadow-md`}
    >
      {displayedText}
    </motion.div>
  );
};

export default HeraMessage;
