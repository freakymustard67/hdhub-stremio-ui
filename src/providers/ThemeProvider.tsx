"use client";
import { type ReactNode, useEffect } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";

function ThemeSync(): null {
  const theme = useSettingsStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") { root.classList.add("dark"); }
    else if (theme === "light") { root.classList.remove("dark"); }
    else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    }
  }, [theme]);
  return null;
}

export function ThemeProvider({ children }: { children: ReactNode }): React.ReactElement {
  return (
    <>
      <ThemeSync />
      {children}
    </>
  );
}
