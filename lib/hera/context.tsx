// lib/hera/context.tsx
"use client";
import { createContext, useContext, ReactNode, useState } from "react";
import { HeraMood } from "@/lib/state";
import { EventType } from "@/lib/hera/types";
import { Profile } from "../generated/prisma";


export interface HeraStatus {
  affection: number;
  delta: number;
  mood: HeraMood;
  moodKey: string;
  event: EventType;
  message: string;
  appearance: HeraAppearance;
}

export interface HeraAppearance {
  frontHairKey: string;
  backHairKey: string;
  clothesKey: string;
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


// user profileを管理するコンテキスト
export interface ProfileContextValue {
  profile: Profile;
  setProfile: (updater: Partial<Profile>) => void;
}
const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({
  initialProfile,
  children,
}: {
  initialProfile: Profile;
  children: ReactNode;
}) {
  const [profile, setProfileState] = useState<Profile>(initialProfile);

  const setProfile = (updater: Partial<Profile>) =>
    setProfileState((prev) => ({ ...prev, ...updater }));

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile() must be used within ProfileProvider");
  return ctx;
}
