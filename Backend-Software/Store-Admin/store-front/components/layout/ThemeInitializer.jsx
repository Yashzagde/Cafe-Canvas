"use client";

import { useEffect } from "react";
import useThemeStore from "@/stores/themeStore";

export default function ThemeInitializer() {
  const activeTheme = useThemeStore((s) => s.activeTheme);
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    // Sync active theme class to document body on mount & update
    if (typeof window !== "undefined") {
      setTheme(activeTheme);
    }
  }, [activeTheme, setTheme]);

  return null;
}
