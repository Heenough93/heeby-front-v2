"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/providers/theme-provider";

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface text-xl text-ink transition hover:border-coral/50 hover:bg-soft"
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      title={isDark ? "라이트 모드" : "다크 모드"}
    >
      <span aria-hidden>{isDark ? "☀" : "☾"}</span>
    </button>
  );
}
