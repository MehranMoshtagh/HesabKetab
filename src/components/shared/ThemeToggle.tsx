"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      setIsDark(true);
    } else if (stored === "light") {
      setIsDark(false);
    } else {
      // No manual override — follow system preference
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  };

  if (!mounted) {
    // Match size so header doesn't jump after hydration
    return <div className="w-[33px] h-[33px]" aria-hidden />;
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-[var(--color-hover)] text-[var(--color-text-secondary)] transition-all duration-200"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
