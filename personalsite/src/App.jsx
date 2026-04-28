import { useState, useEffect, useRef, memo } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { HomePage } from "./components/HomePage";
import { GoalsPage } from "./components/GoalsPage";
import { TasksPage } from "./components/TasksPage";
import { FocusPage } from "./components/FocusPage";
import { HabitsPage } from "./components/HabitsPage";
import { NotesPage } from "./components/NotesPage";
import { StatsPage } from "./components/StatsPage";

import { useLocalStorage, QUOTE_LIST, MOODS, MODES, getTodayKey } from "./utils";
import { invoke } from "@tauri-apps/api/tauri";

// ─── FONTS ───────────────────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');`;

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
  font-size: 54px;
  color: var(--t1);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 60px; /* Fixed height to prevent vertical jitter */
}
.ring-time span { 
  display: inline-block; 
  width: 1.25ch; 
  text-align: center; 
}
.ring-time .colon { 
  width: 0.6ch; 
  opacity: 0.5; 
  font-family: var(--font-m);
  position: relative; 
  top: -2px; 
}
.ring-mode  { font-size: 10px; color: var(--t3); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 2px; }
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

// ─── STYLES COMPONENT ────────────────────────────────────────────────────────
const GlobalStyles = memo(() => (
  <style dangerouslySetInnerHTML={{ __html: STYLES }} />
));

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
    invoke("ping_db")
      .then(res => console.log("MongoDB status:", res))
      .catch(err => console.error("MongoDB error:", err));
  }, []);

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
      <GlobalStyles />
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