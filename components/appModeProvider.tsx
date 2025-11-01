"use client";

import { createClient } from "@/utils/supabase/client";
import { AppMode, DEFAULT_MODE, MODE_COOKIE_NAME } from "@/constants/mode";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type AppModeContextValue = {
  mode: AppMode;
  setMode: (mode: AppMode) => Promise<void>;
  isUpdating: boolean;
};

const AppModeContext = createContext<AppModeContextValue | null>(null);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type ProviderProps = {
  initialMode?: AppMode;
  userId?: string | null;
  children: React.ReactNode;
};

const writeCookie = (mode: AppMode) => {
  document.cookie = `${MODE_COOKIE_NAME}=${mode}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

const applyDomMode = (mode: AppMode) => {
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

export function AppModeProvider({
  initialMode = DEFAULT_MODE,
  userId,
  children,
}: ProviderProps) {
  const [mode, setModeState] = useState<AppMode>(initialMode);
  const [isUpdating, setIsUpdating] = useState(false);
  const syncRanRef = useRef(false);

  const applyModeLocally = useCallback((nextMode: AppMode) => {
    setModeState(nextMode);
    applyDomMode(nextMode);
    writeCookie(nextMode);
  }, []);

  useEffect(() => {
    // Ensure DOM + cookie reflect the server-provided initial mode on hydration
    applyDomMode(initialMode);
    writeCookie(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!userId || syncRanRef.current) return;
    syncRanRef.current = true;

    const syncFromDatabase = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("profile")
          .select("mode")
          .eq("user_id", userId)
          .single();

        if (!error && data?.mode && data.mode !== mode) {
          applyModeLocally(data.mode as AppMode);
        }
      } catch (err) {
        console.error("Failed to sync mode from database", err);
      }
    };

    void syncFromDatabase();
  }, [applyModeLocally, mode, userId]);

  const setMode = useCallback(
    async (nextMode: AppMode) => {
      if (nextMode === mode) return;
      const previousMode = mode;
      applyModeLocally(nextMode);

      if (!userId) return;

      setIsUpdating(true);
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("profile")
          .update({ mode: nextMode })
          .eq("user_id", userId);

        if (error) {
          throw error;
        }
      } catch (err) {
        console.error("Failed to update mode", err);
        applyModeLocally(previousMode);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [applyModeLocally, mode, userId]
  );

  const value = useMemo<AppModeContextValue>(
    () => ({
      mode,
      setMode,
      isUpdating,
    }),
    [mode, setMode, isUpdating]
  );

  return (
    <AppModeContext.Provider value={value}>{children}</AppModeContext.Provider>
  );
}

export const useAppMode = () => {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error("useAppMode must be used within AppModeProvider");
  }
  return context;
};
