import { useState, useEffect, useRef } from "react";

// ─── FONTS ───────────────────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MOODS = ["🌅 Morning", "⚡ Focused", "🌿 Calm", "🔥 Deep Work", "😴 Winding Down"];
const QUOTE_LIST = [
  { text: "Do the hard thing first.", author: "Brian Tracy" },
  { text: "One thing at a time.", author: "Seneca" },
  { text: "Clarity before speed.", author: "Unknown" },
  { text: "Rest is productive.", author: "Unknown" },
  { text: "Small steps, every day.", author: "Unknown" },
  { text: "Knowledge is the only instrument of production not subject to diminishing returns.", author: "J.M. Clark" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
];

const NAV = [
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

const MODES = {
  work: { label: "Focus", duration: 25 * 60, color: "var(--gold)" },
  short: { label: "Short Break", duration: 5 * 60, color: "var(--jade)" },
  long: { label: "Long Break", duration: 15 * 60, color: "var(--indigo)" },
};

const DEFAULT_HABITS = [
  { id: 1, icon: "✍", name: "Morning journaling" },
  { id: 2, icon: "⚡", name: "Exercise 30min" },
  { id: 3, icon: "📖", name: "Read 20 min" },
  { id: 4, icon: "🧘", name: "Meditate" },
  { id: 5, icon: "💧", name: "Drink 2L water" },
  { id: 6, icon: "🚫", name: "No phone till 9am" },
];



const DEFAULT_GOALS = [
  { id: 1, icon: "🎓", name: "Final Exams 2026", desc: "Pass all subjects with distinction", color: "var(--gold)", progress: 62, deadline: "14 days" },
  { id: 2, icon: "💪", name: "Stay Fit", desc: "30 min exercise every day", color: "var(--jade)", progress: 73, deadline: "Ongoing" },
  { id: 3, icon: "📚", name: "Read 12 Books", desc: "Complete reading list by June", color: "var(--indigo)", progress: 58, deadline: "60 days" },
];

const PRIO_COLORS = { high: "var(--rose)", normal: "var(--gold)", low: "var(--t3)" };
const DAYS_SHORT = ["M", "T", "W", "T", "F", "S", "S"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function useLocalStorage(key, init) {
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

function fmtParts(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return [m, sec];
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getTodayIdx() {
  return (new Date().getDay() + 6) % 7;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const STYLES = `
${FONTS}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg:      #0a0a0b;
  --s1:      #111113;
  --s2:      #18181c;
  --s3:      #1f1f26;
  --b1:      rgba(255,255,255,0.05);
  --b2:      rgba(255,255,255,0.10);
  --b3:      rgba(255,255,255,0.18);
  --t1:      #f2ede4;
  --t2:      #9a9590;
  --t3:      #5a5752;
  --gold:    #c9a96e;
  --gold2:   rgba(201,169,110,0.12);
  --gold3:   rgba(201,169,110,0.06);
  --jade:    #4e8c6e;
  --jade2:   rgba(78,140,110,0.12);
  --rose:    #a05454;
  --rose2:   rgba(160,84,84,0.12);
  --indigo:  #5264a0;
  --indigo2: rgba(82,100,160,0.12);
  --r:       10px;
  --font-d:  'Crimson Pro', Georgia, serif;
  --font-b:  'Geist', sans-serif;
  --font-m:  'Geist Mono', monospace;
}

/* BASE */
body {
  background: var(--bg); color: var(--t1);
  font-family: var(--font-b); font-size: 13px; line-height: 1.5;
  overflow: hidden; height: 100vh;
  user-select: none; scrollbar-width: none;
}
body::-webkit-scrollbar { display: none; }
#root { height: 100vh; }

/* LAYOUT */
.shell { display: flex; height: 100vh; width: 100%; }

/* ── SIDEBAR ── */
.sidebar {
  width: 210px; flex-shrink: 0;
  background: var(--s1); border-right: 1px solid var(--b1);
  display: flex; flex-direction: column;
  overflow: hidden;
}
.brand { padding: 20px 16px 16px; border-bottom: 1px solid var(--b1); }
.brand-name { font-family: var(--font-d); font-size: 22px; font-weight: 300; color: var(--gold); letter-spacing: 0.02em; }
.brand-sub  { font-size: 10px; color: var(--t3); letter-spacing: 0.12em; text-transform: uppercase; margin-top: 1px; }

.nav { flex: 1; padding: 8px 0; overflow-y: auto; scrollbar-width: none; }
.nav::-webkit-scrollbar { display: none; }
.nav-section { padding: 16px 14px 4px; font-size: 9px; color: var(--t3); letter-spacing: 0.14em; text-transform: uppercase; }
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 14px; cursor: pointer;
  color: var(--t2); border-left: 2px solid transparent;
  transition: all 0.15s; font-size: 12.5px;
}
.nav-item:hover  { color: var(--t1); background: var(--b1); }
.nav-item.active { color: var(--gold); border-left-color: var(--gold); background: var(--gold3); font-weight: 500; }
.nav-icon  { width: 16px; text-align: center; flex-shrink: 0; font-size: 13px; }
.nav-badge {
  margin-left: auto; background: var(--gold2); color: var(--gold);
  font-size: 9px; padding: 1px 6px; border-radius: 10px; font-family: var(--font-m);
}
.sidebar-footer { padding: 12px 14px 16px; border-top: 1px solid var(--b1); }
.user-row  { display: flex; align-items: center; gap: 10px; }
.avatar    { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg,var(--gold),#8a6a3e); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: #0a0a0b; flex-shrink: 0; }
.user-name { font-size: 12px; color: var(--t1); font-weight: 500; }
.user-role { font-size: 10px; color: var(--t3); }

/* ── MAIN ── */
.main { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg); }
.topbar {
  height: 48px; border-bottom: 1px solid var(--b1);
  display: flex; align-items: center; padding: 0 20px; gap: 12px;
  flex-shrink: 0; background: var(--s1);
}
.topbar-title { font-family: var(--font-d); font-size: 20px; font-weight: 300; color: var(--t1); flex: 1; }
.topbar-date  { font-size: 11px; color: var(--t3); font-family: var(--font-m); }
.mood-dot  { width: 8px; height: 8px; border-radius: 50%; background: var(--jade); flex-shrink: 0; }
.mood-text { font-size: 11px; color: var(--jade); }

.content { flex: 1; overflow-y: auto; padding: 20px; scrollbar-width: none; }
.content::-webkit-scrollbar { display: none; }

/* ── PAGE HEADINGS ── */
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.page-title { font-family: var(--font-d); font-size: 28px; font-weight: 300; color: var(--t1); }
.page-sub   { font-size: 11px; color: var(--t3); margin-top: 2px; }

/* ── CARDS / PANELS ── */
.panel     { background: var(--s2); border: 1px solid var(--b1); border-radius: var(--r); padding: 14px; }
.panel-hd  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.panel-title  { font-size: 10px; color: var(--t3); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500; }
.panel-action { font-size: 10px; color: var(--gold); cursor: pointer; opacity: 0.8; transition: opacity 0.15s; }
.panel-action:hover { opacity: 1; }

.stat-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 16px; }
.stat-card {
  background: var(--s2); border: 1px solid var(--b1); border-radius: var(--r);
  padding: 14px; cursor: pointer; transition: all 0.2s;
  position: relative; overflow: hidden;
}
.stat-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: var(--card-accent, var(--gold)); opacity: 0.6; border-radius: 0 0 var(--r) var(--r); }
.stat-card:hover  { border-color: var(--b2); transform: translateY(-1px); }
.stat-num   { font-family: var(--font-m); font-size: 26px; color: var(--card-accent, var(--gold)); line-height: 1; margin-bottom: 4px; }
.stat-label { font-size: 10px; color: var(--t3); text-transform: uppercase; letter-spacing: 0.08em; }
.stat-sub   { font-size: 10px; color: var(--t2); margin-top: 4px; }
.prog-bar  { height: 3px; background: var(--b1); border-radius: 2px; margin-top: 8px; overflow: hidden; }
.prog-fill { height: 100%; border-radius: 2px; background: var(--card-accent, var(--gold)); transition: width 0.6s; }

.grid2 { display: grid; grid-template-columns: 1fr 1fr;     gap: 12px; margin-bottom: 12px; }
.grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px; }

/* ── TABS ── */
.tabs { display: flex; gap: 2px; background: var(--s3); border-radius: 8px; padding: 3px; margin-bottom: 14px; }
.tab { flex: 1; padding: 6px 10px; border-radius: 6px; font-size: 11px; color: var(--t3); cursor: pointer; text-align: center; transition: all 0.15s; }
.tab.active   { background: var(--s1); color: var(--t1); font-weight: 500; }
.tab:hover:not(.active) { color: var(--t2); }

/* ── BUTTONS ── */
.btn {
  background: var(--gold); color: #0a0a0b; border: none;
  border-radius: 8px; padding: 7px 14px;
  font-family: var(--font-b); font-size: 11.5px; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
  display: inline-flex; align-items: center; gap: 6px;
}
.btn:hover  { opacity: 0.9; transform: scale(1.01); }
.btn:active { transform: scale(0.97); }
.btn-ghost {
  background: transparent; color: var(--t2); border: 1px solid var(--b2);
  border-radius: 8px; padding: 6px 12px;
  font-family: var(--font-b); font-size: 11px; cursor: pointer; transition: all 0.15s;
}
.btn-ghost:hover  { color: var(--t1); border-color: var(--gold); }
.btn-danger { background: var(--rose) !important; color: #fff !important; }
.btn-sm  { padding: 4px 8px !important; font-size: 10px !important; }
.btn-icon {
  background: var(--b1); border: 1px solid var(--b2); color: var(--t2);
  border-radius: 6px; width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 12px; transition: all 0.15s; flex-shrink: 0;
}
.btn-icon:hover { background: var(--b2); color: var(--t1); }
.btn-mode {
  padding: 4px 12px; border-radius: 20px; font-size: 11px; cursor: pointer;
  border: 1px solid var(--b2); background: transparent;
  color: var(--t3); font-family: var(--font-b); transition: all 0.15s;
}
.btn-mode.active { background: var(--gold2); color: var(--gold); border-color: var(--gold); }
.btn-mode:hover:not(.active) { color: var(--t1); border-color: var(--b3); }

/* ── FORMS ── */
.inp {
  background: var(--s3); border: 1px solid var(--b2);
  color: var(--t1); border-radius: 8px; padding: 7px 10px;
  font-family: var(--font-b); font-size: 12.5px; width: 100%;
  outline: none; transition: border-color 0.15s, box-shadow 0.15s;
}
.inp:focus { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold3); }
.inp::placeholder { color: var(--t3); }
textarea.inp { min-height: 100px; resize: none; line-height: 1.6; }

input[type=range] {
  -webkit-appearance: none; appearance: none;
  width: 100%; height: 4px; border-radius: 2px;
  background: var(--b2); outline: none; cursor: pointer;
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 14px; height: 14px; border-radius: 50%;
  background: var(--gold); border: 2px solid var(--bg); cursor: pointer;
}

/* ── TASKS ── */
.task-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 8px;
  background: var(--s3); border: 1px solid var(--b1);
  margin-bottom: 6px; transition: all 0.15s; cursor: pointer;
}
.task-row:hover { border-color: var(--b2); transform: translateX(2px); }
.task-row.done  { opacity: 0.45; }
.task-check {
  width: 16px; height: 16px; border-radius: 50%;
  border: 1.5px solid var(--b3); flex-shrink: 0;
  transition: all 0.2s; cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 9px;
}
.task-check.checked { background: var(--jade); border-color: var(--jade); color: white; }
.task-text { flex: 1; font-size: 12.5px; color: var(--t1); }
.task-text.done { text-decoration: line-through; color: var(--t3); }
.task-tag { font-size: 9px; padding: 2px 7px; border-radius: 10px; background: var(--gold2); color: var(--gold); flex-shrink: 0; }

/* ── HABITS ── */
.habit-row {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 8px;
  background: var(--s3); border: 1px solid var(--b1); margin-bottom: 6px;
}
.habit-icon   { font-size: 14px; width: 20px; text-align: center; flex-shrink: 0; }
.habit-name   { flex: 1; font-size: 12.5px; color: var(--t1); }
.habit-streak { font-size: 10px; color: var(--jade); font-family: var(--font-m); margin-right: 4px; }
.habit-dots   { display: flex; gap: 4px; }
.h-dot {
  width: 20px; height: 20px; border-radius: 50%;
  border: 1.5px solid var(--b2); cursor: pointer;
  transition: all 0.15s; display: flex;
  align-items: center; justify-content: center; font-size: 8px;
}
.h-dot.done  { background: var(--jade); border-color: var(--jade); color: rgba(255,255,255,0.9); }
.h-dot.today { border-color: var(--gold); }
.h-dot:hover { border-color: var(--gold); transform: scale(1.1); }

/* ── SUBJECTS ── */
.subject-row { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 8px; background: var(--s3); border: 1px solid var(--b1); margin-bottom: 6px; }
.subj-bar  { width: 3px; align-self: stretch; border-radius: 2px; flex-shrink: 0; }
.subj-name { font-size: 12.5px; color: var(--t1); font-weight: 500; }
.subj-meta { font-size: 10px; color: var(--t3); margin-top: 1px; }
.mini-prog { height: 3px; background: var(--b1); border-radius: 2px; margin-top: 5px; overflow: hidden; }
.mini-fill { height: 100%; border-radius: 2px; background: var(--gold); }

/* ── NOTES ── */
.note-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
.note-item {
  background: var(--s3); border: 1px solid var(--b1);
  border-radius: 8px; padding: 12px; cursor: pointer;
  transition: all 0.2s; position: relative; overflow: hidden;
}
.note-item::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--note-color, var(--gold)); }
.note-item:hover { border-color: var(--b2); transform: translateY(-2px); }
.note-title { font-size: 12.5px; font-weight: 500; color: var(--t1); margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.note-prev  { font-size: 11px; color: var(--t3); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.note-date  { font-size: 9px; color: var(--t3); margin-top: 8px; font-family: var(--font-m); }
.note-tag   { display: inline-block; font-size: 9px; padding: 1px 6px; border-radius: 8px; margin-top: 4px; }

/* ── JOURNAL ── */
.journal-entry { background: var(--s3); border: 1px solid var(--b1); border-radius: 8px; padding: 12px; margin-bottom: 8px; cursor: pointer; transition: all 0.15s; }
.journal-entry:hover  { border-color: var(--b2); }
.journal-date { font-size: 10px; color: var(--gold); font-family: var(--font-m); margin-bottom: 4px; }
.journal-text { font-family: var(--font-d); font-size: 14px; color: var(--t1); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-style: italic; }

/* ── GOAL CARDS ── */
.goal-card { background: var(--s2); border: 1px solid var(--b1); border-radius: var(--r); padding: 16px; }
.goal-sub-row { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 8px; background: var(--s3); border: 1px solid var(--b1); margin-bottom: 6px; }

/* ── CHARTS ── */
.bar-chart { display: flex; align-items: flex-end; gap: 6px; height: 90px; }
.bar-col   { flex: 1; display: flex; flex-direction: column; align-items: center; }
.bar-body  { width: 100%; border-radius: 3px 3px 0 0; border-top: 1px solid var(--gold); background: var(--gold2); min-height: 2px; transition: height 0.5s; }
.bar-body.jade   { border-top-color: var(--jade);   background: var(--jade2); }
.bar-body.indigo { border-top-color: var(--indigo); background: var(--indigo2); }
.bar-labels { display: flex; margin-top: 4px; }
.bar-lbl   { flex: 1; text-align: center; font-size: 9px; color: var(--t3); }

/* ── POMODORO ── */
.ring-wrap { position: relative; display: inline-flex; align-items: center; justify-content: center; }
.ring-wrap svg { transform: rotate(-90deg); filter: drop-shadow(0 0 12px rgba(201,169,110,0.15)); }
.ring-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
.ring-time  {
  font-family: var(--font-m);
  font-size: 52px;
  color: var(--t1);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
  width: 100%;
  letter-spacing: -0.02em;
}
.ring-time span { display: inline-block; min-width: 0.65em; text-align: center; }
.ring-time .colon { min-width: 0.25em; opacity: 0.5; font-family: var(--font-b); position: relative; top: -4px; }
.ring-mode  { font-size: 10px; color: var(--t3); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px; }
.session-dots { display: flex; gap: 5px; justify-content: center; margin: 12px 0; }
.s-dot { width: 8px; height: 8px; border-radius: 50%; border: 1px solid var(--b2); transition: all 0.3s; }
.s-dot.done   { background: var(--gold); border-color: var(--gold); }
.s-dot.active { background: var(--rose); border-color: var(--rose); animation: blink 1s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }

/* ── QUOTE / HERO ── */
.hero h1 { font-family: var(--font-d); font-size: 36px; font-weight: 300; color: var(--t1); line-height: 1.1; letter-spacing: -0.01em; }
.hero p  { color: var(--t3); font-size: 12px; margin-top: 4px; }
.quote-banner {
  background: var(--s2); border: 1px solid var(--b1);
  border-left: 3px solid var(--gold);
  border-radius: 0 var(--r) var(--r) 0;
  padding: 14px 16px; margin-bottom: 20px;
}
.quote-text   { font-family: var(--font-d); font-size: 16px; font-style: italic; color: var(--t1); line-height: 1.5; }
.quote-author { font-size: 10px; color: var(--gold); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 6px; font-weight: 500; }

/* ── MISC ── */
.divider { height: 1px; background: var(--b1); margin: 10px 0; }
.row     { display: flex; align-items: center; gap: 8px; }
.between { justify-content: space-between; }
.col     { display: flex; flex-direction: column; gap: 8px; }
.mt1 { margin-top: 8px; }
.mt2 { margin-top: 16px; }
.mb1 { margin-bottom: 8px; }
.mb2 { margin-bottom: 16px; }
.empty-state { text-align: center; padding: 40px; color: var(--t3); font-size: 12px; }

@media (max-width: 800px) {
  .sidebar { width: 56px; }
  .brand, .nav-section, .nav-item span:not(.nav-icon), .sidebar-footer .user-name, .sidebar-footer .user-role { display: none; }
  .nav-item { justify-content: center; padding: 10px; }
  .main .content { padding: 12px; }
  .stat-row { grid-template-columns: 1fr 1fr; }
  .grid2, .grid3, .note-grid { grid-template-columns: 1fr; }
}
`;

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [mood, setMood] = useLocalStorage("mood", MOODS[0]);
  const [quote] = useState(() => QUOTE_LIST[Math.floor(Math.random() * QUOTE_LIST.length)]);
  const [sessions, setSessions] = useLocalStorage("pom_sessions", 0);

  // Pomodoro state lifted to root so it persists across navigation
  const [pomMode, setPomMode] = useState("work");
  const [pomSecs, setPomSecs] = useState(MODES.work.duration);
  const [pomRunning, setPomRunning] = useState(false);
  const [customWork, setCustomWork] = useLocalStorage("pom_work", 25);
  const [customShort, setCustomShort] = useLocalStorage("pom_short", 5);
  const [focusSessions, setFocusSessions] = useLocalStorage("focus_sessions", []);
  const [currentTask, setCurrentTask] = useState("");
  const [currentCategory, setCurrentCategory] = useState("General");
  const ivRef = useRef(null);

  useEffect(() => {
    setPomSecs(pomMode === "work" ? customWork * 60 : pomMode === "short" ? customShort * 60 : 15 * 60);
    setPomRunning(false);
  }, [pomMode, customWork, customShort]);

  useEffect(() => {
    if (pomRunning) {
      ivRef.current = setInterval(() => {
        setPomSecs(s => {
          if (s <= 1) {
            clearInterval(ivRef.current);
            setPomRunning(false);
            if (pomMode === "work") {
              setSessions(p => p + 1);
              // Save to "Database"
              const newSession = {
                id: Date.now(),
                task: currentTask || "Deep Work",
                category: currentCategory,
                duration: customWork,
                date: getTodayKey(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              setFocusSessions(prev => [newSession, ...prev]);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(ivRef.current);
    }
    return () => clearInterval(ivRef.current);
  }, [pomRunning, pomMode]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="shell">
        <Sidebar page={page} setPage={setPage} sessions={sessions} />
        <div className="main">
          <TopBar dateStr={dateStr} mood={mood} page={page} />
          <div className="content">
            {page === "home" && <HomePage greeting={greeting} dateStr={dateStr} quote={quote} setPage={setPage} sessions={sessions} />}
            {page === "goals" && <GoalsPage />}
            {page === "tasks" && <TasksPage />}
            {page === "focus" && (
              <FocusPage
                mode={pomMode} setMode={setPomMode}
                secs={pomSecs} setSecs={setPomSecs}
                running={pomRunning} setRunning={setPomRunning}
                sessions={sessions} setSessions={setSessions}
                customWork={customWork} setCustomWork={setCustomWork}
                customShort={customShort} setCustomShort={setCustomShort}
                focusSessions={focusSessions} setFocusSessions={setFocusSessions}
                currentTask={currentTask} setCurrentTask={setCurrentTask}
                currentCategory={currentCategory} setCurrentCategory={setCurrentCategory}
              />
            )}
            {page === "habits" && <HabitsPage />}
            {page === "notes" && <NotesPage />}
            {page === "stats" && <StatsPage focusSessions={focusSessions} />}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, sessions }) {
  const [todos] = useLocalStorage("todos", []);
  const remaining = todos.filter(t => !t.done).length;
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-name">Meridian</div>
        <div className="brand-sub">Personal OS</div>
      </div>
      <nav className="nav">
        {NAV.map((n, i) =>
          n.section ? (
            <div key={i} className="nav-section">{n.section}</div>
          ) : (
            <div
              key={n.id}
              className={`nav-item ${page === n.id ? "active" : ""}`}
              onClick={() => setPage(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
              {n.badge && remaining > 0 && (
                <span className="nav-badge">{remaining}</span>
              )}
            </div>
          )
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="user-row">
          <div className="avatar">Y</div>
          <div>
            <div className="user-name">You</div>
            <div className="user-role">Personal OS</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
const PAGE_TITLES = {
  home: "Dashboard", goals: "Goals",
  tasks: "Tasks", focus: "Focus Timer",
  habits: "Habits", notes: "Notes", stats: "Analytics",
};

function TopBar({ dateStr, mood, page }) {
  return (
    <div className="topbar">
      <div className="topbar-title">{PAGE_TITLES[page] || page}</div>
      <div className="topbar-date">{dateStr}</div>
      <div className="row">
        <div className="mood-dot" />
        <div className="mood-text">{mood}</div>
      </div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ greeting, dateStr, quote, setPage, sessions }) {
  const [focusSessions] = useLocalStorage("focus_sessions", []);
  const [todos] = useLocalStorage("todos", []);
  const doneCount = todos.filter(t => t.done).length;
  const total = todos.length;

  const totalFocusMins = focusSessions.reduce((acc, s) => acc + s.duration, 0);
  const totalFocusHrs = (totalFocusMins / 60).toFixed(1);

  // Group focus sessions by day for the chart
  const weekData = [0, 0, 0, 0, 0, 0, 0];
  const today = new Date();
  focusSessions.forEach(s => {
    const sDate = new Date(s.date);
    const diff = Math.floor((today - sDate) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff < 7) {
      const idx = (sDate.getDay() + 6) % 7;
      weekData[idx] += s.duration / 60;
    }
  });
  const maxW = Math.max(...weekData, 1);

  return (
    <div>
      <div className="hero mb2">
        <h1>{greeting}.</h1>
        <p>{dateStr}</p>
      </div>

      <div className="quote-banner">
        <div className="quote-text">"{quote.text}"</div>
        <div className="quote-author">— {quote.author}</div>
      </div>

      <div className="stat-row">
        <div className="stat-card" style={{ "--card-accent": "var(--gold)" }} onClick={() => setPage("tasks")}>
          <div className="stat-num">{doneCount}/{total}</div>
          <div className="stat-label">Tasks Done</div>
          <div className="stat-sub">{total - doneCount} remaining</div>
          <div className="prog-bar"><div className="prog-fill" style={{ width: total ? `${(doneCount / total) * 100}%` : "0%" }} /></div>
        </div>
        <div className="stat-card" style={{ "--card-accent": "var(--jade)" }} onClick={() => setPage("focus")}>
          <div className="stat-num">{sessions}</div>
          <div className="stat-label">Sessions Today</div>
          <div className="stat-sub">{((sessions * 25) / 60).toFixed(1)}h focused</div>
          <div className="prog-bar"><div className="prog-fill" style={{ width: `${Math.min(sessions / 8 * 100, 100)}%`, background: "var(--jade)" }} /></div>
        </div>
        <div className="stat-card" style={{ "--card-accent": "var(--indigo)" }} onClick={() => setPage("focus")}>
          <div className="stat-num">{totalFocusHrs}h</div>
          <div className="stat-label">Deep Work</div>
          <div className="stat-sub">Total time tracked</div>
          <div className="prog-bar"><div className="prog-fill" style={{ width: "100%", background: "var(--indigo)" }} /></div>
        </div>
        <div className="stat-card" style={{ "--card-accent": "var(--rose)" }} onClick={() => setPage("habits")}>
          <div className="stat-num">5/6</div>
          <div className="stat-label">Habits Done</div>
          <div className="stat-sub">83% today</div>
          <div className="prog-bar"><div className="prog-fill" style={{ width: "83%", background: "var(--rose)" }} /></div>
        </div>
      </div>

      <div className="grid2">
        <QuickTasksWidget setPage={setPage} />
        <QuickHabitsWidget setPage={setPage} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="panel" style={{ gridColumn: "1/3" }}>
          <div className="panel-hd"><div className="panel-title">Focus Hours This Week</div></div>
          <div className="bar-chart">
            {weekData.map((v, i) => (
              <div key={i} className="bar-col">
                <div className="bar-body jade" style={{ height: `${(v / maxW) * 75}px` }} />
              </div>
            ))}
          </div>
          <div className="bar-labels">
            {DAYS_SHORT.map((d, i) => (
              <div key={i} className="bar-lbl" style={{ color: i === getTodayIdx() ? "var(--gold)" : "var(--t3)" }}>{d}</div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-hd"><div className="panel-title">Top Goal</div></div>
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🎓</div>
            <div style={{ fontFamily: "var(--font-d)", fontSize: 15, color: "var(--t1)" }}>Final Exams</div>
            <div style={{ fontSize: 10, color: "var(--t3)", margin: "4px 0 12px" }}>14 days remaining</div>
            <div style={{ background: "var(--b1)", borderRadius: 4, height: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "62%", background: "var(--gold)", borderRadius: 4 }} />
            </div>
            <div style={{ fontFamily: "var(--font-m)", fontSize: 20, color: "var(--gold)", marginTop: 10 }}>62%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickTasksWidget({ setPage }) {
  const [todos, setTodos] = useLocalStorage("todos", []);
  const [text, setText] = useState("");
  const add = () => {
    if (!text.trim()) return;
    setTodos([{ id: Date.now(), text: text.trim(), done: false, priority: "normal", tag: "general", date: getTodayKey() }, ...todos]);
    setText("");
  };
  return (
    <div className="panel">
      <div className="panel-hd">
        <div className="panel-title">Today's Tasks</div>
        <div className="panel-action" onClick={() => setPage("tasks")}>View all →</div>
      </div>
      <div className="row mb1">
        <input className="inp" value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()} placeholder="Quick task..." style={{ flex: 1 }} />
        <button className="btn" onClick={add} style={{ flexShrink: 0 }}>+</button>
      </div>
      {todos.slice(0, 5).map(t => (
        <div key={t.id} className={`task-row ${t.done ? "done" : ""}`}>
          <div className={`task-check ${t.done ? "checked" : ""}`} onClick={() => setTodos(todos.map(x => x.id === t.id ? { ...x, done: !x.done } : x))}>
            {t.done ? "✓" : ""}
          </div>
          <span className={`task-text ${t.done ? "done" : ""}`}>{t.text}</span>
        </div>
      ))}
      {todos.length === 0 && <div className="empty-state">No tasks yet</div>}
    </div>
  );
}

function QuickHabitsWidget({ setPage }) {
  const [habits] = useLocalStorage("habits", DEFAULT_HABITS);
  const [done, setDone] = useLocalStorage("habit_done", {});
  const todayIdx = getTodayIdx();
  const key = (hid) => `${hid}-${getTodayKey()}-${todayIdx}`;
  const toggle = (hid) => { const k = key(hid); setDone(d => ({ ...d, [k]: !d[k] })); };

  return (
    <div className="panel">
      <div className="panel-hd">
        <div className="panel-title">Today's Habits</div>
        <div className="panel-action" onClick={() => setPage("habits")}>View all →</div>
      </div>
      {habits.map(h => (
        <div key={h.id} className="habit-row" style={{ marginBottom: 6 }}>
          <span className="habit-icon">{h.icon}</span>
          <span className="habit-name">{h.name}</span>
          <div className={`h-dot today ${done[key(h.id)] ? "done" : ""}`} onClick={() => toggle(h.id)}>
            {done[key(h.id)] ? "✓" : ""}
          </div>
        </div>
      ))}
    </div>
  );
}


// ─── GOALS PAGE ───────────────────────────────────────────────────────────────
function GoalsPage() {
  const [goals, setGoals] = useLocalStorage("goals", DEFAULT_GOALS);
  const [tab, setTab] = useState(0);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", desc: "", icon: "🎯", color: "var(--gold)", deadline: "30 days", progress: 0 });

  const active = goals.filter(g => !g.completed);
  const complete = goals.filter(g => g.completed);

  const saveGoal = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setGoals(goals.map(g => g.id === editing ? { ...g, ...form } : g));
    } else {
      setGoals([...goals, { id: Date.now(), ...form, completed: false }]);
    }
    closeForm();
  };

  const closeForm = () => {
    setEditing(null);
    setShowForm(false);
    setForm({ name: "", desc: "", icon: "🎯", color: "var(--gold)", deadline: "30 days", progress: 0 });
  };

  const startEdit = (g) => {
    setEditing(g.id);
    setForm({ name: g.name, desc: g.desc, icon: g.icon, color: g.color, deadline: g.deadline, progress: g.progress });
    setShowForm(true);
  };

  const delGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Goals</div><div className="page-sub">Set intentions. Track progress. Achieve.</div></div>
        <button className="btn" onClick={() => setShowForm(true)}>+ New Goal</button>
      </div>

      {showForm && (
        <div className="panel mb2">
          <div className="panel-hd"><div className="panel-title">{editing ? "Edit Goal" : "Create Goal"}</div></div>
          <div className="col">
            <div className="row">
              <input className="inp" placeholder="Goal name..." value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ flex: 1 }} />
              <input className="inp" placeholder="Icon" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} style={{ width: 50 }} />
            </div>
            <input className="inp" placeholder="Description..." value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} />
            <div className="row">
              <input className="inp" placeholder="Deadline (e.g. 14 days)" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} style={{ flex: 1 }} />
              <select className="inp" value={form.color} onChange={e => setForm({...form, color: e.target.value})} style={{ width: 120 }}>
                <option value="var(--gold)">Gold</option>
                <option value="var(--jade)">Jade</option>
                <option value="var(--rose)">Rose</option>
                <option value="var(--indigo)">Indigo</option>
              </select>
            </div>
            <div>
              <div className="row between mb1"><span style={{fontSize: 11, color: "var(--t3)"}}>Progress</span><span style={{fontFamily: "var(--font-m)", color: form.color}}>{form.progress}%</span></div>
              <input type="range" value={form.progress} onChange={e => setForm({...form, progress: +e.target.value})} />
            </div>
            <div className="row mt1">
              <button className="btn" onClick={saveGoal}>{editing ? "Save Changes" : "Create Goal"}</button>
              <button className="btn-ghost" onClick={closeForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="tabs">
        {["Active", "Completed", "Long-term"].map((t, i) => (
          <div key={i} className={`tab ${tab === i ? "active" : ""}`} onClick={() => setTab(i)}>{t}</div>
        ))}
      </div>

      <div className="grid2">
        {(tab === 1 ? complete : active).map(g => (
          <div key={g.id} className="goal-card" style={{ borderColor: `color-mix(in srgb, ${g.color} 30%, var(--b1))` }}>
            <div className="row between mb1">
              <span style={{ fontSize: 24 }}>{g.icon}</span>
              <div className="row">
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: `color-mix(in srgb, ${g.color} 15%, transparent)`, color: g.color }}>
                  {g.deadline}
                </span>
                <div className="btn-icon btn-sm" onClick={() => startEdit(g)}>✎</div>
                <div className="btn-icon btn-sm" onClick={() => delGoal(g.id)}>×</div>
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-d)", fontSize: 18, color: "var(--t1)", marginBottom: 4 }}>{g.name}</div>
            <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 14 }}>{g.desc}</div>
            <div className="row between" style={{ marginBottom: 4, fontSize: 11, color: "var(--t3)" }}>
              <span>Progress</span>
              <span style={{ color: g.color, fontFamily: "var(--font-m)" }}>{g.progress}%</span>
            </div>
            <div style={{ background: "var(--b1)", borderRadius: 4, height: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${g.progress}%`, background: g.color, borderRadius: 4, transition: "width 0.5s" }} />
            </div>
            <div className="mt1">
              <button className="btn-ghost btn-sm" onClick={() => setGoals(goals.map(x => x.id === g.id ? {...x, completed: !x.completed} : x))}>
                {g.completed ? "Mark Active" : "Mark Complete"}
              </button>
            </div>
          </div>
        ))}
        {!showForm && (
          <div className="goal-card" style={{ border: "1px dashed var(--b2)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 160, cursor: "pointer" }}
            onClick={() => setShowForm(true)}
            onMouseEnter={e => e.currentTarget.style.background = "var(--b1)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, opacity: 0.4, marginBottom: 8 }}>+</div>
              <div style={{ fontSize: 12, color: "var(--t3)" }}>Add new goal</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TASKS PAGE ───────────────────────────────────────────────────────────────
function TasksPage() {
  const [todos, setTodos] = useLocalStorage("todos", []);
  const [text, setText] = useState("");
  const [prio, setPrio] = useState("normal");
  const [tag, setTag] = useState("general");
  const [filter, setFilter] = useState("all");

  const add = () => {
    if (!text.trim()) return;
    setTodos([{ id: Date.now(), text: text.trim(), done: false, priority: prio, tag, date: getTodayKey() }, ...todos]);
    setText(""); setPrio("normal");
  };
  const toggle = id => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const del = id => setTodos(todos.filter(t => t.id !== id));
  const clear = () => setTodos(todos.filter(t => !t.done));

  const filtered = todos.filter(t =>
    filter === "all" ? true : filter === "active" ? !t.done : t.done
  );
  const remaining = todos.filter(t => !t.done).length;
  const done = todos.filter(t => t.done).length;

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Tasks</div><div className="page-sub">{remaining} remaining · {done} done</div></div>
      </div>

      <div className="panel mb2">
        <div className="row">
          <input className="inp" placeholder="What needs to be done?" value={text}
            onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} style={{ flex: 1 }} />
          <select className="inp" value={tag} onChange={e => setTag(e.target.value)} style={{ width: 90, flexShrink: 0 }}>
            <option value="general">General</option>
            <option value="study">Study</option>
            <option value="math">Math</option>
            <option value="physics">Physics</option>
            <option value="english">English</option>
          </select>
          <select className="inp" value={prio} onChange={e => setPrio(e.target.value)} style={{ width: 80, flexShrink: 0 }}>
            <option value="high">↑ High</option>
            <option value="normal">• Normal</option>
            <option value="low">↓ Low</option>
          </select>
          <button className="btn" onClick={add}>Add</button>
        </div>
      </div>

      <div className="row mb1" style={{ flexWrap: "wrap", gap: 6 }}>
        {["all", "active", "done"].map(f => (
          <button key={f} className={`btn-mode ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn-ghost btn-sm" onClick={clear}>Clear done</button>
      </div>

      {filtered.length === 0 && <div className="empty-state">No tasks here.</div>}
      {filtered.map(t => (
        <div key={t.id} className={`task-row ${t.done ? "done" : ""}`}>
          <div style={{ width: 3, height: 26, borderRadius: 2, background: PRIO_COLORS[t.priority], flexShrink: 0 }} />
          <div className={`task-check ${t.done ? "checked" : ""}`} onClick={() => toggle(t.id)}>{t.done ? "✓" : ""}</div>
          <span className={`task-text ${t.done ? "done" : ""}`}>{t.text}</span>
          <span className="task-tag">{t.tag || "general"}</span>
          <div className="btn-icon" onClick={() => del(t.id)}>×</div>
        </div>
      ))}
    </div>
  );
}



// ─── FOCUS / POMODORO PAGE ────────────────────────────────────────────────────
function FocusPage({ mode, setMode, secs, setSecs, running, setRunning, sessions, setSessions, customWork, setCustomWork, customShort, setCustomShort, focusSessions, setFocusSessions, currentTask, setCurrentTask, currentCategory, setCurrentCategory }) {
  const total = mode === "work" ? customWork * 60 : mode === "short" ? customShort * 60 : 15 * 60;
  const circ = 2 * Math.PI * 78;
  const offset = circ * (1 - secs / total);
  const col = MODES[mode].color;

  const reset = () => {
    setRunning(false);
    setSecs(total);
  };

  const delSession = (id) => {
    setFocusSessions(focusSessions.filter(s => s.id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Focus Timer</div>
          <div className="page-sub">{sessions} sessions completed today · {((sessions * customWork) / 60).toFixed(1)}h total</div>
        </div>
      </div>

      <div className="row mb2" style={{ gap: 6, justifyContent: "center" }}>
        {Object.entries(MODES).map(([k, v]) => (
          <button key={k} className={`btn-mode ${mode === k ? "active" : ""}`} onClick={() => setMode(k)}>{v.label}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        <div className="panel" style={{ textAlign: "center", padding: "28px 14px" }}>
          <div className="ring-wrap" style={{ marginBottom: 14 }}>
            <svg width="180" height="180">
              <circle cx="90" cy="90" r="78" fill="none" stroke="var(--s3)" strokeWidth="6" />
              <circle cx="90" cy="90" r="78" fill="none" stroke={col} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.5s, stroke 0.3s" }} />
            </svg>
            <div className="ring-inner">
              <div className="ring-time">
                {(() => {
                  const [m, s] = fmtParts(secs);
                  return (
                    <>
                      <span>{m}</span>
                      <span className="colon">:</span>
                      <span>{s}</span>
                    </>
                  );
                })()}
              </div>
              <div className="ring-mode">{MODES[mode].label}</div>
            </div>
          </div>

          {mode === "work" && (
            <div className="col mb2" style={{ maxWidth: 280, margin: "0 auto" }}>
              <input className="inp" placeholder="What are you focusing on?" value={currentTask} onChange={e => setCurrentTask(e.target.value)} disabled={running} />
              <select className="inp" value={currentCategory} onChange={e => setCurrentCategory(e.target.value)} disabled={running}>
                <option value="General">General</option>
                <option value="Coding">Coding</option>
                <option value="Learning">Learning</option>
                <option value="Planning">Planning</option>
                <option value="Rest">Rest</option>
              </select>
            </div>
          )}

          <div className="session-dots">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`s-dot ${i < sessions ? "done" : i === sessions && running ? "active" : ""}`} />
            ))}
          </div>

          <div className="row" style={{ justifyContent: "center", gap: 10 }}>
            <button className="btn-ghost" onClick={reset}>Reset</button>
            <button className="btn" style={{ minWidth: 100, background: running ? "var(--rose)" : "var(--gold)" }}
              onClick={() => setRunning(r => !r)}>
              {running ? "Pause" : "Start"}
            </button>
          </div>
        </div>

        <div className="col">
          <div className="panel">
            <div className="panel-hd"><div className="panel-title">Focus History</div></div>
            <div style={{ maxHeight: 300, overflowY: "auto", scrollbarWidth: "none" }}>
              {focusSessions.map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--b1)" }}>
                  <div style={{ width: 3, height: 32, borderRadius: 2, background: "var(--gold)", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "var(--t1)", fontWeight: 500 }}>{s.task}</div>
                    <div style={{ fontSize: 10, color: "var(--t3)" }}>{s.category} · {s.duration}m</div>
                  </div>
                  <div style={{ textAlign: "right", paddingRight: 8 }}>
                    <div style={{ fontFamily: "var(--font-m)", fontSize: 11, color: "var(--t2)" }}>{s.time}</div>
                    <div style={{ fontSize: 9, color: "var(--t3)" }}>{s.date}</div>
                  </div>
                  <div className="btn-icon btn-sm" onClick={() => delSession(s.id)}>×</div>
                </div>
              ))}
              {focusSessions.length === 0 && <div className="empty-state">No sessions recorded yet.</div>}
            </div>
          </div>

          <div className="panel">
            <div className="panel-title" style={{ marginBottom: 14 }}>Settings</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div className="row between" style={{ marginBottom: 8, fontSize: 11, color: "var(--t3)" }}>
                  <span>Focus</span><span style={{ color: "var(--gold)", fontFamily: "var(--font-m)" }}>{customWork}m</span>
                </div>
                <input type="range" min={5} max={60} step={5} value={customWork} onChange={e => setCustomWork(+e.target.value)} />
              </div>
              <div>
                <div className="row between" style={{ marginBottom: 8, fontSize: 11, color: "var(--t3)" }}>
                  <span>Short Break</span><span style={{ color: "var(--jade)", fontFamily: "var(--font-m)" }}>{customShort}m</span>
                </div>
                <input type="range" min={1} max={15} value={customShort} onChange={e => setCustomShort(+e.target.value)} />
              </div>
            </div>
            <div className="divider" />
            <div className="row between">
              <button className="btn-ghost btn-sm" onClick={() => setSessions(0)} style={{ color: "var(--rose)", borderColor: "var(--rose2)" }}>
                Reset sessions
              </button>
              <button className="btn-ghost btn-sm" onClick={() => setFocusSessions([])} style={{ color: "var(--rose)", borderColor: "var(--rose2)" }}>
                Clear History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HABITS PAGE ──────────────────────────────────────────────────────────────
function HabitsPage() {
  const [habits, setHabits] = useLocalStorage("habits", DEFAULT_HABITS);
  const [done, setDone] = useLocalStorage("habit_done", {});
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("✦");
  const todayIdx = getTodayIdx();
  const weekKey = (hid, day) => `${hid}-${getTodayKey()}-${day}`;

  const toggle = (hid, day) => { const k = weekKey(hid, day); setDone(d => ({ ...d, [k]: !d[k] })); };
  const addHabit = () => {
    if (!newName.trim()) return;
    setHabits([...habits, { id: Date.now(), icon: newIcon, name: newName.trim() }]);
    setNewName("");
  };
  const delHabit = id => setHabits(habits.filter(h => h.id !== id));
  const streakCount = hid => {
    let s = 0;
    for (let d = todayIdx; d >= 0; d--) {
      if (done[weekKey(hid, d)]) s++; else break;
    }
    return s;
  };

  const ICONS = ["✦", "⚡", "📖", "🧘", "💧", "🚫", "🏃", "🎯", "✍", "🥗"];

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Habits</div><div className="page-sub">Build consistency, one day at a time.</div></div>
      </div>

      <div className="panel mb2">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingRight: 28 }}>
          <div style={{ flex: 1 }} />
          {DAYS_SHORT.map((d, i) => (
            <div key={i} style={{ width: 22, textAlign: "center", fontSize: 9, color: i === todayIdx ? "var(--gold)" : "var(--t3)" }}>{d}</div>
          ))}
        </div>
        {habits.map(h => (
          <div key={h.id} className="habit-row">
            <span className="habit-icon">{h.icon}</span>
            <span className="habit-name">{h.name}</span>
            {streakCount(h.id) > 0 && (
              <span className="habit-streak">🔥{streakCount(h.id)}</span>
            )}
            <div className="habit-dots">
              {DAYS_SHORT.map((_, i) => (
                <div key={i} className={`h-dot ${done[weekKey(h.id, i)] ? "done" : ""} ${i === todayIdx ? "today" : ""}`}
                  style={{ opacity: i > todayIdx ? 0.3 : 1 }}
                  onClick={() => i <= todayIdx && toggle(h.id, i)}>
                  {done[weekKey(h.id, i)] ? "✓" : ""}
                </div>
              ))}
            </div>
            <div className="btn-icon" onClick={() => delHabit(h.id)}>×</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-title mb1">Add New Habit</div>
        <div className="row">
          <select className="inp" value={newIcon} onChange={e => setNewIcon(e.target.value)} style={{ width: 60, flexShrink: 0 }}>
            {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
          </select>
          <input className="inp" placeholder="e.g. Meditate 10 min" value={newName}
            onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && addHabit()} style={{ flex: 1 }} />
          <button className="btn" onClick={addHabit}>Add</button>
        </div>
      </div>
    </div>
  );
}

// ─── NOTES PAGE ───────────────────────────────────────────────────────────────
const NOTE_COLORS = ["var(--gold)", "var(--jade)", "var(--rose)", "var(--indigo)"];
const NOTE_TAGS = ["General", "Physics", "Math", "Chemistry", "English", "Planning"];

function NotesPage() {
  const [notes, setNotes] = useLocalStorage("notes", []);
  const [active, setActive] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [noteTag, setNoteTag] = useState("General");
  const [tab, setTab] = useState(0);

  const newNote = () => {
    const n = {
      id: Date.now(), title: "Untitled Note", body: "",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      tag: "General", color: NOTE_COLORS[0],
    };
    setNotes([n, ...notes]);
    setActive(n.id); setTitle(n.title); setBody(n.body); setNoteTag(n.tag);
  };
  const save = () => setNotes(notes.map(n => n.id === active ? { ...n, title: title || "Untitled", body, tag: noteTag } : n));
  const del = id => { setNotes(notes.filter(n => n.id !== id)); if (active === id) setActive(null); };
  const open = n => { setActive(n.id); setTitle(n.title); setBody(n.body); setNoteTag(n.tag); };

  const filtered = notes.filter(n => {
    const q = search.toLowerCase();
    const matchQ = n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
    const matchTab = tab === 0 ? true : n.tag === NOTE_TAGS[tab];
    return matchQ && matchTab;
  });

  if (active) {
    const note = notes.find(n => n.id === active);
    return (
      <div>
        <div className="panel col">
          <div className="row between">
            <button className="btn-ghost btn-sm" onClick={() => { save(); setActive(null); }}>← Back</button>
            <div className="row">
              <select className="inp" value={noteTag} onChange={e => setNoteTag(e.target.value)} style={{ width: 110 }}>
                {NOTE_TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
              <button className="btn btn-sm" onClick={save}>Save</button>
              <button className="btn btn-sm btn-danger" onClick={() => del(active)}>Delete</button>
            </div>
          </div>
          <input className="inp" value={title} onChange={e => setTitle(e.target.value)}
            style={{ fontSize: "1.3rem", border: "none", borderBottom: "1px solid var(--b2)", borderRadius: 0, padding: "8px 0", background: "transparent" }} />
          <textarea className="inp" value={body} onChange={e => setBody(e.target.value)}
            placeholder="Start writing..." style={{ minHeight: 400, background: "transparent", border: "none", borderRadius: 0, padding: "8px 0", resize: "vertical" }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Notes</div><div className="page-sub">{notes.length} notes</div></div>
        <button className="btn" onClick={newNote}>+ New Note</button>
      </div>
      <input className="inp" placeholder="Search notes..." value={search}
        onChange={e => setSearch(e.target.value)} style={{ marginBottom: 14 }} />
      <div className="tabs">
        {NOTE_TAGS.map((t, i) => (
          <div key={t} className={`tab ${tab === i ? "active" : ""}`} onClick={() => setTab(i)}>{t}</div>
        ))}
      </div>
      <div className="note-grid">
        {filtered.map(n => (
          <div key={n.id} className="note-item" style={{ "--note-color": n.color }} onClick={() => open(n)}>
            <div className="note-title">{n.title}</div>
            <div className="note-prev">{n.body || "Empty note..."}</div>
            <div className="note-tag" style={{ background: `color-mix(in srgb, ${n.color} 15%, transparent)`, color: n.color }}>{n.tag}</div>
            <div className="note-date">{n.date}</div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="empty-state">No notes found. Create one above.</div>}
    </div>
  );
}

// ─── STATS PAGE ───────────────────────────────────────────────────────────────
// ─── STATS PAGE ───────────────────────────────────────────────────────────────
function StatsPage({ focusSessions }) {
  const [todos] = useLocalStorage("todos", []);
  const [habits] = useLocalStorage("habits", DEFAULT_HABITS);
  const [done] = useLocalStorage("habit_done", {});

  const doneCount = todos.filter(t => t.done).length;
  const total = todos.length;
  
  const totalFocusMins = focusSessions.reduce((acc, s) => acc + s.duration, 0);
  const totalFocusHrs = (totalFocusMins / 60).toFixed(1);

  // Group focus sessions by day
  const weekBars = [0, 0, 0, 0, 0, 0, 0];
  const today = new Date();
  focusSessions.forEach(s => {
    const sDate = new Date(s.date);
    const diff = Math.floor((today - sDate) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff < 7) {
      const idx = (sDate.getDay() + 6) % 7;
      weekBars[idx] += s.duration / 60;
    }
  });
  
  const taskBars = [5, 4, 0, 7, 4, 2, 0];
  const maxW = Math.max(...weekBars, 1);
  const maxT = Math.max(...taskBars, 1);

  const todayIdx = getTodayIdx();
  const habitRate = habits.length > 0
    ? Math.round(habits.filter(h => done[`${h.id}-${getTodayKey()}-${todayIdx}`]).length / habits.length * 100)
    : 0;

  // Category Distribution
  const categories = {};
  focusSessions.forEach(s => {
    categories[s.category] = (categories[s.category] || 0) + s.duration;
  });
  const totalMins = Math.max(totalFocusMins, 1);
  const catDist = Object.entries(categories).map(([name, mins]) => ({
    name,
    pct: Math.round((mins / totalMins) * 100),
    c: name === "Coding" ? "var(--gold)" : name === "Learning" ? "var(--jade)" : name === "Planning" ? "var(--indigo)" : "var(--rose)"
  }));

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Analytics</div><div className="page-sub">Your productivity at a glance.</div></div>
      </div>

      <div className="stat-row mb2">
        {[
          { label: "Deep Work", val: `${totalFocusHrs}h`, accent: "var(--gold)", pct: Math.min(+totalFocusHrs / 40 * 100, 100) },
          { label: "Tasks Done", val: doneCount, accent: "var(--jade)", pct: total ? doneCount / total * 100 : 0 },
          { label: "Focus Rate", val: `${focusSessions.length} sess`, accent: "var(--indigo)", pct: Math.min(focusSessions.length / 20 * 100, 100) },
          { label: "Habit Rate", val: `${habitRate}%`, accent: "var(--rose)", pct: habitRate },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ "--card-accent": s.accent }}>
            <div className="stat-num">{s.val}</div>
            <div className="stat-label">{s.label}</div>
            <div className="prog-bar"><div className="prog-fill" style={{ width: `${s.pct}%`, background: s.accent }} /></div>
          </div>
        ))}
      </div>

      <div className="grid2">
        <div className="panel">
          <div className="panel-hd"><div className="panel-title">Focus Hours / Day (This Week)</div></div>
          <div className="bar-chart">
            {weekBars.map((v, i) => (
              <div key={i} className="bar-col">
                <div className="bar-body jade" style={{ height: `${(v / maxW) * 75}px` }} />
              </div>
            ))}
          </div>
          <div className="bar-labels">
            {DAYS_SHORT.map((d, i) => (
              <div key={i} className="bar-lbl" style={{ color: i === getTodayIdx() ? "var(--gold)" : "var(--t3)" }}>{d}</div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-hd"><div className="panel-title">Tasks Completed / Day</div></div>
          <div className="bar-chart">
            {taskBars.map((v, i) => (
              <div key={i} className="bar-col">
                <div className="bar-body" style={{ height: `${(v / maxT) * 75}px` }} />
              </div>
            ))}
          </div>
          <div className="bar-labels">
            {DAYS_SHORT.map((d, i) => (
              <div key={i} className="bar-lbl" style={{ color: i === getTodayIdx() ? "var(--gold)" : "var(--t3)" }}>{d}</div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-hd"><div className="panel-title">Focus Distribution</div></div>
          {catDist.length > 0 ? catDist.map(s => (
            <div key={s.name} style={{ marginBottom: 10 }}>
              <div className="row between" style={{ fontSize: 11, color: "var(--t2)", marginBottom: 4 }}>
                <span>{s.name}</span>
                <span style={{ color: s.c, fontFamily: "var(--font-m)" }}>{s.pct}%</span>
              </div>
              <div style={{ background: "var(--b1)", borderRadius: 2, height: 5, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${s.pct}%`, background: s.c, borderRadius: 2 }} />
              </div>
            </div>
          )) : <div className="empty-state">No focus data yet</div>}
        </div>
        <div className="panel">
          <div className="panel-hd"><div className="panel-title">Habit Consistency (This Week)</div></div>
          {habits.slice(0, 5).map(h => {
            const doneCount2 = DAYS_SHORT.filter((_, i) => done[`${h.id}-${getTodayKey()}-${i}`]).length;
            const pct = Math.round(doneCount2 / 7 * 100);
            return (
              <div key={h.id} style={{ marginBottom: 10 }}>
                <div className="row between" style={{ fontSize: 11, color: "var(--t2)", marginBottom: 4 }}>
                  <span>{h.icon} {h.name}</span>
                  <span style={{ color: "var(--jade)", fontFamily: "var(--font-m)" }}>{pct}%</span>
                </div>
                <div style={{ background: "var(--b1)", borderRadius: 2, height: 5, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "var(--jade)", borderRadius: 2 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}