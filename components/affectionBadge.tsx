"use client";
import { useHera } from "@/lib/hera/context";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function AffectionBadge() {
  const { affection, delta } = useHera();
  const initial = affection - delta;
  const [display, setDisplay] = useState(initial);
  const interval = 150; // アニメーションの間隔 150ms

  useEffect(() => {
    if (delta === 0) return;
    let cur = initial;
    const step = delta > 0 ? 1 : -1;
    const timer = setInterval(() => {
      cur += step;
      setDisplay(cur);
      if (cur === affection) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [affection, delta]);

  return (
    <div className="inline-flex items-center justify-center z-50 w-16 h-16 md:w-20 md:h-20 bg-pink-300 dark:bg-pink-400 dark:border-pink-500 rounded-full p-4">
      <motion.div
        key={display}
        initial={{ scale: 0.5, opacity: 0.2 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <span className="text-pink-50 font-bold text-2xl md:text-3xl tabular-nums">
          {display}
        </span>
      </motion.div>
    </div>
  );
}
