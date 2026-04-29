import { useState, useEffect } from "react";

export const MOODS = ["🌅 Morning", "⚡ Focused", "🌿 Calm", "🔥 Deep Work", "😴 Winding Down"];
export const QUOTE_LIST = [
  { text: "Do the hard thing first.", author: "Brian Tracy" },
  { text: "One thing at a time.", author: "Seneca" },
  { text: "Clarity before speed.", author: "Unknown" },
  { text: "Rest is productive.", author: "Unknown" },
  { text: "Small steps, every day.", author: "Unknown" },
  { text: "Knowledge is the only instrument of production not subject to diminishing returns.", author: "J.M. Clark" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
];

export const NAV = [
  { section: "Overview" },
  { id: "home", label: "Dashboard", icon: "⌂" },
  { id: "goals", label: "Goals", icon: "◈" },
  { section: "Productivity" },
  { id: "tasks", label: "Tasks", icon: "✓", badge: true },
  { id: "focus", label: "Focus Timer", icon: "◎" },
  { section: "Wellness" },
  { id: "habits", label: "Habits", icon: "▦" },
  { id: "notes", label: "Notes", icon: "≡" },
  { section: "Insights" },
  { id: "stats", label: "Analytics", icon: "↗" },
];

export const MODES = {
  work: { label: "Focus", duration: 25 * 60, color: "var(--gold)" },
  short: { label: "Short Break", duration: 5 * 60, color: "var(--jade)" },
  long: { label: "Long Break", duration: 15 * 60, color: "var(--indigo)" },
};

export const DEFAULT_HABITS = [];

export const DEFAULT_GOALS = [];

export const PRIO_COLORS = { high: "var(--rose)", normal: "var(--gold)", low: "var(--t3)" };
export const DAYS_SHORT = ["M", "T", "W", "T", "F", "S", "S"];

export function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : init;
    } catch { return init; }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(val));
  }, [key, val]);
  return [val, setVal];
}

export function fmtParts(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return [m, sec];
}

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getTodayIdx() {
  return (new Date().getDay() + 6) % 7;
}
