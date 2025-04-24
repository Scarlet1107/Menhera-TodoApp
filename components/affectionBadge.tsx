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
    <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-200 rounded-full p-4">
      <motion.div
        key={display}
        initial={{ scale: 0.5, opacity: 0.2 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <span className="text-white font-bold text-xl tabular-nums">
          {display}
        </span>
      </motion.div>
    </div>
  );
}
