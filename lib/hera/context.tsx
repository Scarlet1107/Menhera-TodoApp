// lib/hera/context.tsx
"use client";
import { createContext, useContext, ReactNode } from "react";
import { HeraMood } from "@/lib/state";
import { EventType } from "@/lib/hera/types";

/**
 * API で返却されるヘラちゃんステータス型
 */
export interface HeraStatus {
  affection: number;
  mood: HeraMood;
  event: EventType;
  message: string;
}

// Context と Provider
const HeraContext = createContext<HeraStatus | null>(null);
export const HeraProvider = ({
  status,
  children,
}: {
  status: HeraStatus;
  children: ReactNode;
}) => <HeraContext.Provider value={status}>{children}</HeraContext.Provider>;

// フック
export function useHera(): HeraStatus {
  const ctx = useContext(HeraContext);
  if (!ctx) throw new Error("useHera() must be used within HeraProvider");
  return ctx;
}
