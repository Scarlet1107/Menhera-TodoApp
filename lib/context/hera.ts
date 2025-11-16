"use client";

import {
  createContext,
  createElement,
  ReactNode,
  useContext,
  useState,
} from "react";
import { HeraMood } from "@/lib/state";
import { EventType } from "@/lib/hera/types";

export interface HeraAppearance {
  frontHairKey: string;
  backHairKey: string;
  clothesKey: string;
}

export interface HeraStatus {
  affection: number;
  delta: number;
  mood: HeraMood;
  moodKey: string;
  event: EventType;
  message: string;
  appearance: HeraAppearance;
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
    setHeraStatusState(prev => ({ ...prev, ...updater }));

  return createElement(
    HeraContext.Provider,
    { value: { ...heraStatus, setHeraStatus } },
    children,
  );
};

export function useHera(): HeraContextValue {
  const ctx = useContext(HeraContext);
  if (!ctx) throw new Error("useHera() must be used within HeraProvider");
  return ctx;
}
