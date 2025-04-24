// lib/hera/context.tsx
"use client";
import { createContext, useContext, ReactNode, useState } from "react";
import { HeraMood } from "@/lib/state";
import { EventType } from "@/lib/hera/types";

export interface HeraStatus {
  affection: number;
  delta: number;
  mood: HeraMood;
  event: EventType;
  message: string;
}

export interface HeraContextValue extends HeraStatus {
  setHeraStatus: (updater: Partial<HeraStatus>) => void;
}

const HeraContext = createContext<HeraContextValue | null>(null);

export const HeraProvider = ({
  status: initialStatus,
  children,
}: {
  status: HeraStatus;
  children: ReactNode;
}) => {
  const [heraStatus, setHeraStatusState] = useState<HeraStatus>(initialStatus);

  const setHeraStatus = (updater: Partial<HeraStatus>) =>
    setHeraStatusState((prev) => ({ ...prev, ...updater }));

  return (
    <HeraContext.Provider value={{ ...heraStatus, setHeraStatus }}>
      {children}
    </HeraContext.Provider>
  );
};

export function useHera(): HeraContextValue {
  const ctx = useContext(HeraContext);
  if (!ctx) throw new Error("useHera() must be used within HeraProvider");
  return ctx;
}
