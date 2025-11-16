"use client";

import {
    createContext,
    createElement,
    ReactNode,
    useContext,
    useState,
} from "react";
import { Profile } from "@/lib/generated/prisma";

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
        setProfileState(prev => ({ ...prev, ...updater }));

    return createElement(
        ProfileContext.Provider,
        { value: { profile, setProfile } },
        children,
    );
}

export function useProfile(): ProfileContextValue {
    const ctx = useContext(ProfileContext);
    if (!ctx) throw new Error("useProfile() must be used within ProfileProvider");
    return ctx;
}
