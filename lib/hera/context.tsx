// lib/hera/context.tsx
"use client";
import { createContext, useContext, ReactNode } from "react";
import { HeraMood } from "@/lib/state";
import { EventType } from "@/lib/hera/types";

/**
 * API で返却されるヘラちゃんステータス型
 */
export interface HeraStatus {
  affection: number; // 今の好感度
  delta: number; // 今回変化した好感度（例：+3 → 3）
  mood: HeraMood;
  event: EventType;
  message: string;
}

const HeraContext = createContext<HeraStatus | null>(null);

export const HeraProvider = ({
  status,
  children,
}: {
  status: HeraStatus;
  children: ReactNode;
}) => <HeraContext.Provider value={status}>{children}</HeraContext.Provider>;

export function useHera(): HeraStatus {
  const ctx = useContext(HeraContext);
  if (!ctx) throw new Error("useHera() must be used within HeraProvider");
  return ctx;
}
