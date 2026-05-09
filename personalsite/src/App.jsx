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

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap');`;

const STYLES = `
${FONTS}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg:      #050508;
  --bg-gradient: radial-gradient(circle at 15% 50%, rgba(20, 15, 30, 1), rgba(5, 5, 8, 1) 40%),
                 radial-gradient(circle at 85% 30%, rgba(10, 20, 25, 1), rgba(5, 5, 8, 1) 40%);
  --s1:      rgba(15, 15, 20, 0.4);
  --s2:      rgba(25, 25, 35, 0.4);
  --s3:      rgba(35, 35, 45, 0.4);
  --b1:      rgba(255, 255, 255, 0.04);
  --b2:      rgba(255, 255, 255, 0.08);
  --b3:      rgba(255, 255, 255, 0.12);
  --t1:      #ffffff;
  --t2:      #a1a1aa;
  --t3:      #71717a;
  --gold:    #eab308;
  --gold-glow: rgba(234, 179, 8, 0.3);
  --gold2:   rgba(234, 179, 8, 0.15);
  --gold3:   rgba(234, 179, 8, 0.08);
  --jade:    #10b981;
  --jade2:   rgba(16, 185, 129, 0.15);
  --rose:    #f43f5e;
  --rose2:   rgba(244, 63, 94, 0.15);
  --indigo:  #6366f1;
  --indigo2: rgba(99, 102, 241, 0.15);
  --r:       16px;
  --font-d:  'Outfit', sans-serif;
  --font-b:  'Geist', sans-serif;
  --font-m:  'Geist Mono', monospace;
  --blur:    backdrop-filter: blur(24px) saturate(180%);
}

/* BASE */
body {
  background: var(--bg);
  background-image: var(--bg-gradient);
  background-attachment: fixed;
  color: var(--t1);
  font-family: var(--font-b); font-size: 13px; line-height: 1.5;
  overflow: hidden; height: 100vh;
  user-select: none; scrollbar-width: none;
}
body::-webkit-scrollbar { display: none; }
#root { height: 100vh; }

/* LAYOUT */
.shell { display: flex; height: 100vh; width: 100%; position: relative; z-index: 1; }

/* ── SIDEBAR ── */
.sidebar {
  width: 240px; flex-shrink: 0;
  background: var(--s1);
  border-right: 1px solid var(--b1);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  backdrop-filter: blur(24px) saturate(180%);
  display: flex; flex-direction: column;
  overflow: hidden;
  box-shadow: 4px 0 24px rgba(0,0,0,0.2);
}
.brand { padding: 24px 20px 20px; border-bottom: 1px solid var(--b1); }
.brand-name { font-family: var(--font-d); font-size: 26px; font-weight: 600; background: linear-gradient(135deg, #fff, var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.02em; }
.brand-sub  { font-size: 10px; color: var(--t3); letter-spacing: 0.15em; text-transform: uppercase; margin-top: 4px; font-weight: 500;}

.nav { flex: 1; padding: 12px 0; overflow-y: auto; scrollbar-width: none; }
.nav::-webkit-scrollbar { display: none; }
.nav-section { padding: 20px 16px 8px; font-size: 10px; color: var(--t3); letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; }
.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 16px; cursor: pointer; margin: 4px 12px; border-radius: 10px;
  color: var(--t2); 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-size: 13px; font-weight: 500;
}
.nav-item:hover  { color: var(--t1); background: var(--b1); transform: translateX(4px); }
.nav-item.active { color: var(--t1); background: linear-gradient(90deg, var(--gold2), transparent); box-shadow: inset 2px 0 0 var(--gold); }
.nav-item.active .nav-icon { color: var(--gold); }
.nav-icon  { width: 18px; text-align: center; flex-shrink: 0; font-size: 14px; transition: color 0.3s; }
.nav-badge {
  margin-left: auto; background: var(--gold); color: #000;
  font-size: 10px; padding: 2px 8px; border-radius: 12px; font-family: var(--font-m); font-weight: 600;
  box-shadow: 0 0 10px var(--gold-glow);
}
.sidebar-footer { padding: 16px 20px; border-top: 1px solid var(--b1); background: rgba(0,0,0,0.2); }
.user-row  { display: flex; align-items: center; gap: 12px; cursor: pointer; transition: transform 0.2s; }
.user-row:hover { transform: translateY(-2px); }
.avatar    { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg,var(--gold),#d97706); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: #fff; flex-shrink: 0; box-shadow: 0 4px 12px var(--gold-glow); }
.user-name { font-size: 13px; color: var(--t1); font-weight: 600; }
.user-role { font-size: 11px; color: var(--t3); }

/* ── MAIN ── */
.main { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
.topbar {
  height: 60px; border-bottom: 1px solid var(--b1);
  display: flex; align-items: center; padding: 0 32px; gap: 16px;
  flex-shrink: 0; background: var(--s1);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  backdrop-filter: blur(24px) saturate(180%);
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
  z-index: 10;
}
.topbar-title { font-family: var(--font-d); font-size: 22px; font-weight: 500; color: var(--t1); flex: 1; letter-spacing: -0.01em; }
.topbar-date  { font-size: 12px; color: var(--t2); font-family: var(--font-m); background: var(--b1); padding: 6px 12px; border-radius: 20px; border: 1px solid var(--b1); }
.mood-dot  { width: 10px; height: 10px; border-radius: 50%; background: var(--jade); flex-shrink: 0; box-shadow: 0 0 10px var(--jade); animation: pulse 2s infinite; }
.mood-text { font-size: 12px; color: var(--jade); font-weight: 500; }

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.content { flex: 1; overflow-y: auto; padding: 32px; scrollbar-width: none; position: relative; z-index: 5; }
.content::-webkit-scrollbar { display: none; }

/* ── PAGE HEADINGS ── */
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; animation: slideDown 0.5s ease-out; }
.page-title { font-family: var(--font-d); font-size: 32px; font-weight: 600; color: var(--t1); letter-spacing: -0.02em; }
.page-sub   { font-size: 13px; color: var(--t2); margin-top: 4px; }

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── CARDS / PANELS ── */
.panel {
  background: var(--s2); border: 1px solid var(--b1); border-radius: var(--r); padding: 20px;
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  backdrop-filter: blur(16px) saturate(180%);
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
}
.panel:hover { border-color: var(--b2); transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
.panel-hd  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.panel-title  { font-size: 11px; color: var(--t2); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; }
.panel-action { font-size: 12px; color: var(--gold); cursor: pointer; opacity: 0.7; transition: all 0.2s; }
.panel-action:hover { opacity: 1; transform: scale(1.1); }

.stat-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; animation: fadeUp 0.6s ease-out; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.stat-card {
  background: linear-gradient(145deg, var(--s2), rgba(20,20,25,0.2));
  border: 1px solid var(--b1); border-radius: var(--r);
  padding: 20px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative; overflow: hidden;
  -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
.stat-card::before {
  content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
  transform: skewX(-20deg); transition: 0.5s;
}
.stat-card:hover::before { left: 150%; }
.stat-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: var(--card-accent, var(--gold)); opacity: 0.8; transition: height 0.3s; }
.stat-card:hover  { border-color: var(--b2); transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.25); }
.stat-card:hover::after { height: 4px; box-shadow: 0 0 15px var(--card-accent, var(--gold)); }
.stat-num   { font-family: var(--font-m); font-size: 32px; font-weight: 500; color: var(--t1); line-height: 1; margin-bottom: 6px; }
.stat-label { font-size: 11px; color: var(--card-accent, var(--gold)); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; }
.stat-sub   { font-size: 11px; color: var(--t3); margin-top: 6px; }
.prog-bar  { height: 4px; background: var(--b1); border-radius: 2px; margin-top: 12px; overflow: hidden; }
.prog-fill { height: 100%; border-radius: 2px; background: var(--card-accent, var(--gold)); transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 10px var(--card-accent, var(--gold)); }

.grid2 { display: grid; grid-template-columns: 1fr 1fr;     gap: 16px; margin-bottom: 16px; }
.grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }

/* ── TABS ── */
.tabs { display: flex; gap: 4px; background: var(--b1); border-radius: 12px; padding: 4px; margin-bottom: 20px; border: 1px solid var(--b1); }
.tab { flex: 1; padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; color: var(--t2); cursor: pointer; text-align: center; transition: all 0.2s; }
.tab.active   { background: var(--s2); color: var(--t1); box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 1px solid var(--b1); }
.tab:hover:not(.active) { color: var(--t1); background: var(--b1); }

/* ── BUTTONS ── */
.btn {
  background: linear-gradient(135deg, var(--gold), #d97706); color: #000; border: none;
  border-radius: 10px; padding: 10px 20px;
  font-family: var(--font-b); font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  display: inline-flex; align-items: center; gap: 8px;
  box-shadow: 0 4px 15px var(--gold-glow);
}
.btn:hover  { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(234, 179, 8, 0.4); }
.btn:active { transform: scale(0.96); }
.btn-ghost {
  background: var(--b1); color: var(--t1); border: 1px solid var(--b2);
  border-radius: 10px; padding: 8px 16px;
  font-family: var(--font-b); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.btn-ghost:hover  { background: var(--b2); border-color: var(--t2); transform: translateY(-1px); }
.btn-danger { background: linear-gradient(135deg, var(--rose), #e11d48) !important; color: #fff !important; box-shadow: 0 4px 15px var(--rose2) !important; }
.btn-sm  { padding: 6px 12px !important; font-size: 11px !important; }
.btn-icon {
  background: var(--s2); border: 1px solid var(--b2); color: var(--t2);
  border-radius: 8px; width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 14px; transition: all 0.2s; flex-shrink: 0;
}
.btn-icon:hover { background: var(--b2); color: var(--t1); border-color: var(--t2); transform: scale(1.05); }
.btn-mode {
  padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer;
  border: 1px solid var(--b2); background: transparent;
  color: var(--t2); font-family: var(--font-b); transition: all 0.2s;
}
.btn-mode.active { background: var(--gold2); color: var(--gold); border-color: var(--gold); box-shadow: 0 0 10px var(--gold-glow); }
.btn-mode:hover:not(.active) { color: var(--t1); background: var(--b1); }

/* ── FORMS ── */
.inp {
  background: var(--s2); border: 1px solid var(--b2);
  color: var(--t1); border-radius: 10px; padding: 10px 14px;
  font-family: var(--font-b); font-size: 13px; width: 100%;
  outline: none; transition: all 0.2s;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}
.inp:focus { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-glow), inset 0 2px 4px rgba(0,0,0,0.1); }
.inp::placeholder { color: var(--t3); }
textarea.inp { min-height: 120px; resize: none; line-height: 1.6; }

input[type=range] {
  -webkit-appearance: none; appearance: none;
  width: 100%; height: 6px; border-radius: 3px;
  background: var(--b2); outline: none; cursor: pointer;
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--gold); border: 2px solid var(--bg); cursor: pointer;
  box-shadow: 0 0 10px var(--gold-glow); transition: transform 0.1s;
}
input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.15); }

/* ── TASKS ── */
.task-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 10px;
  background: var(--s2); border: 1px solid var(--b1);
  margin-bottom: 8px; transition: all 0.2s; cursor: pointer;
}
.task-row:hover { border-color: var(--b2); transform: translateX(4px); background: var(--s3); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.task-row.done  { opacity: 0.5; }
.task-check {
  width: 20px; height: 20px; border-radius: 50%;
  border: 2px solid var(--t3); flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 10px;
}
.task-check:hover { border-color: var(--jade); background: var(--jade2); }
.task-check.checked { background: var(--jade); border-color: var(--jade); color: #fff; box-shadow: 0 0 10px var(--jade2); }
.task-text { flex: 1; font-size: 13.5px; color: var(--t1); font-weight: 500; }
.task-text.done { text-decoration: line-through; color: var(--t3); }
.task-tag { font-size: 10px; padding: 3px 8px; border-radius: 12px; background: var(--gold2); color: var(--gold); flex-shrink: 0; font-weight: 600; }

/* ── HABITS ── */
.habit-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 10px;
  background: var(--s2); border: 1px solid var(--b1); margin-bottom: 8px;
  transition: transform 0.2s;
}
.habit-row:hover { transform: translateY(-2px); border-color: var(--b2); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
.habit-icon   { font-size: 16px; width: 24px; text-align: center; flex-shrink: 0; }
.habit-name   { flex: 1; font-size: 13.5px; color: var(--t1); font-weight: 500; }
.habit-streak { font-size: 11px; color: var(--jade); font-family: var(--font-m); margin-right: 8px; font-weight: 600; }
.habit-dots   { display: flex; gap: 6px; }
.h-dot {
  width: 24px; height: 24px; border-radius: 50%;
  border: 2px solid var(--b2); cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); display: flex;
  align-items: center; justify-content: center; font-size: 10px;
  background: var(--s1);
}
.h-dot.done  { background: var(--jade); border-color: var(--jade); color: #fff; box-shadow: 0 0 10px var(--jade2); }
.h-dot.today { border-color: var(--gold); box-shadow: 0 0 8px var(--gold-glow); }
.h-dot:hover { border-color: var(--gold); transform: scale(1.15); }

/* ── SUBJECTS ── */
.subject-row { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 10px; background: var(--s2); border: 1px solid var(--b1); margin-bottom: 8px; transition: transform 0.2s; }
.subject-row:hover { transform: translateY(-2px); border-color: var(--b2); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.subj-bar  { width: 4px; align-self: stretch; border-radius: 2px; flex-shrink: 0; }
.subj-name { font-size: 13.5px; color: var(--t1); font-weight: 600; }
.subj-meta { font-size: 11px; color: var(--t3); margin-top: 2px; }
.mini-prog { height: 4px; background: var(--b1); border-radius: 2px; margin-top: 8px; overflow: hidden; }
.mini-fill { height: 100%; border-radius: 2px; background: var(--gold); box-shadow: 0 0 8px var(--gold-glow); }

/* ── NOTES ── */
.note-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.note-item {
  background: linear-gradient(145deg, var(--s2), rgba(20,20,25,0.2)); border: 1px solid var(--b1);
  border-radius: 12px; padding: 16px; cursor: pointer;
  transition: all 0.3s; position: relative; overflow: hidden;
}
.note-item::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--note-color, var(--gold)); opacity: 0.8; }
.note-item:hover { border-color: var(--b2); transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.2); }
.note-item:hover::before { height: 4px; box-shadow: 0 0 12px var(--note-color, var(--gold)); }
.note-title { font-size: 14px; font-weight: 600; color: var(--t1); margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.note-prev  { font-size: 12px; color: var(--t2); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.note-date  { font-size: 10px; color: var(--t3); margin-top: 12px; font-family: var(--font-m); font-weight: 500; }
.note-tag   { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 12px; margin-top: 6px; font-weight: 600; }

/* ── JOURNAL ── */
.journal-entry { background: var(--s2); border: 1px solid var(--b1); border-radius: 10px; padding: 16px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; }
.journal-entry:hover  { border-color: var(--b2); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
.journal-date { font-size: 11px; color: var(--gold); font-family: var(--font-m); margin-bottom: 6px; font-weight: 600; }
.journal-text { font-family: var(--font-d); font-size: 15px; color: var(--t1); line-height: 1.7; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-style: italic; }

/* ── GOAL CARDS ── */
.goal-card { background: var(--s2); border: 1px solid var(--b1); border-radius: var(--r); padding: 24px; transition: transform 0.3s, box-shadow 0.3s; }
.goal-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.2); border-color: var(--b2); }
.goal-sub-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; background: var(--s3); border: 1px solid var(--b1); margin-bottom: 8px; transition: transform 0.2s; }
.goal-sub-row:hover { transform: translateX(4px); border-color: var(--b2); }

/* ── CHARTS ── */
.bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 120px; margin-top: 16px; padding: 0 8px; }
.bar-col   { flex: 1; display: flex; flex-direction: column; align-items: center; group: hover; cursor: pointer; }
.bar-body  { width: 100%; border-radius: 4px 4px 0 0; border-top: 2px solid var(--gold); background: linear-gradient(to top, var(--gold3), var(--gold2)); min-height: 4px; transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s; position: relative; overflow: hidden; }
.bar-body::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 100%; background: linear-gradient(180deg, rgba(255,255,255,0.1), transparent); opacity: 0; transition: opacity 0.3s; }
.bar-col:hover .bar-body::after { opacity: 1; }
.bar-body.jade   { border-top-color: var(--jade);   background: linear-gradient(to top, rgba(16,185,129,0.05), var(--jade2)); }
.bar-body.indigo { border-top-color: var(--indigo); background: linear-gradient(to top, rgba(99,102,241,0.05), var(--indigo2)); }
.bar-labels { display: flex; margin-top: 8px; }
.bar-lbl   { flex: 1; text-align: center; font-size: 10px; color: var(--t3); font-weight: 500; }

/* ── POMODORO ── */
.ring-wrap { position: relative; display: inline-flex; align-items: center; justify-content: center; }
.ring-wrap svg { transform: rotate(-90deg); filter: drop-shadow(0 0 20px rgba(234, 179, 8, 0.25)); transition: filter 0.3s; }
.ring-wrap:hover svg { filter: drop-shadow(0 0 30px rgba(234, 179, 8, 0.4)); }
.ring-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
.ring-time  {
  font-family: var(--font-m);
  font-size: 64px;
  color: var(--t1);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 72px; 
  font-weight: 500;
  text-shadow: 0 0 20px rgba(255,255,255,0.1);
}
.ring-time span { display: inline-block; width: 1.25ch; text-align: center; }
.ring-time .colon { width: 0.6ch; opacity: 0.5; font-family: var(--font-m); position: relative; top: -3px; }
.ring-mode  { font-size: 11px; color: var(--t2); letter-spacing: 0.15em; text-transform: uppercase; margin-top: 4px; font-weight: 600; }
.session-dots { display: flex; gap: 8px; justify-content: center; margin: 20px 0; }
.s-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--b2); transition: all 0.3s; background: var(--s1); }
.s-dot.done   { background: var(--gold); border-color: var(--gold); box-shadow: 0 0 10px var(--gold-glow); }
.s-dot.active { background: var(--rose); border-color: var(--rose); animation: blink 1.5s ease-in-out infinite; box-shadow: 0 0 10px var(--rose2); }
@keyframes blink { 0%,100%{opacity:1; transform:scale(1);} 50%{opacity:0.5; transform:scale(0.8);} }

/* ── QUOTE / HERO ── */
.hero { animation: fadeUp 0.8s ease-out; }
.hero h1 { font-family: var(--font-d); font-size: 42px; font-weight: 600; color: var(--t1); line-height: 1.1; letter-spacing: -0.02em; text-shadow: 0 4px 20px rgba(0,0,0,0.5); }
.hero p  { color: var(--t2); font-size: 14px; margin-top: 8px; font-weight: 400; }
.quote-banner {
  background: linear-gradient(90deg, var(--s2), transparent); border: 1px solid var(--b1);
  border-left: 4px solid var(--gold);
  border-radius: 0 var(--r) var(--r) 0;
  padding: 20px 24px; margin-bottom: 24px;
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  position: relative; overflow: hidden;
}
.quote-banner::after { content: '"'; position: absolute; top: -10px; right: 20px; font-size: 120px; font-family: var(--font-d); color: var(--b1); line-height: 1; pointer-events: none; }
.quote-text   { font-family: var(--font-d); font-size: 18px; font-style: italic; color: var(--t1); line-height: 1.6; position: relative; z-index: 1; }
.quote-author { font-size: 11px; color: var(--gold); letter-spacing: 0.15em; text-transform: uppercase; margin-top: 10px; font-weight: 600; position: relative; z-index: 1; }

/* ── MISC ── */
.divider { height: 1px; background: linear-gradient(90deg, transparent, var(--b2), transparent); margin: 16px 0; }
.row     { display: flex; align-items: center; gap: 12px; }
.between { justify-content: space-between; }
.col     { display: flex; flex-direction: column; gap: 12px; }
.mt1 { margin-top: 12px; }
.mt2 { margin-top: 24px; }
.mb1 { margin-bottom: 12px; }
.mb2 { margin-bottom: 24px; }
.empty-state { text-align: center; padding: 48px 24px; color: var(--t3); font-size: 13px; background: var(--s2); border: 1px dashed var(--b2); border-radius: var(--r); margin-top: 16px; }

@media (max-width: 800px) {
  .sidebar { width: 64px; }
  .brand, .nav-section, .nav-item span:not(.nav-icon), .sidebar-footer .user-name, .sidebar-footer .user-role { display: none; }
  .nav-item { justify-content: center; padding: 12px; }
  .main .content { padding: 16px; }
  .stat-row { grid-template-columns: 1fr 1fr; }
  .grid2, .grid3, .note-grid { grid-template-columns: 1fr; }
  .topbar { padding: 0 16px; }
  .page-title { font-size: 26px; }
}

/* ── WELCOME OVERLAY ── */
.welcome-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg);
  background-image: var(--bg-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeOut 2s forwards 1s; /* delay then fade */
}
.welcome-title {
  font-family: var(--font-d);
  font-size: 56px;
  font-weight: 500;
  color: var(--t1);
  opacity: 0;
  animation: slideIn 1s cubic-bezier(0.4, 0, 0.2, 1) forwards, fadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.5s;
  background: linear-gradient(135deg, #fff, var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 20px var(--gold-glow));
}
@keyframes slideIn {
  from { transform: translateY(-30px); }
  to { transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fadeOut {
  to { opacity: 0; visibility: hidden; }
}
`;ateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fadeOut {
  to { opacity: 0; visibility: hidden; }
}`;

// ─── STYLES COMPONENT ────────────────────────────────────────────────────────
const GlobalStyles = memo(() => (
  <style dangerouslySetInnerHTML={{ __html: STYLES }} />
));

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  // Hide welcome after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 2500);
    return () => clearTimeout(timer);
  }, []);
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
      <GlobalStyles />
      {showWelcome && (
        <div className="welcome-overlay">
          <h1 className="welcome-title">Welcome</h1>
        </div>
      )}
      <div className="shell" style={{ visibility: showWelcome ? 'hidden' : 'visible' }}>
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