"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const useThemeStore = create(
  persist(
    (set, get) => ({
      activeTheme: "theme-02", // Default to Liquid Glass Basic

      setTheme: (themeId) => {
        set({ activeTheme: themeId });
        if (typeof window !== "undefined") {
          const body = document.body;
          // Clean existing theme- classes
          const classes = body.className.split(" ").filter((c) => !c.startsWith("theme-"));
          body.className = classes.join(" ");
          // Apply new theme class
          body.classList.add(themeId);
        }
      },
    }),
    { name: "cafe-canva-theme" }
  )
);

export default useThemeStore;
