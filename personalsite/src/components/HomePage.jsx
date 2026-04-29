import { useState } from "react";
import { useLocalStorage, getTodayKey, getTodayIdx, DAYS_SHORT, DEFAULT_HABITS } from "../utils";

export function HomePage({ greeting, dateStr, quote, setPage, sessions }) {
  const [focusSessions] = useLocalStorage("focus_sessions", []);
  const [todos] = useLocalStorage("todos", []);
  const [goals] = useLocalStorage("goals", []);
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

  const activeGoals = goals.filter(g => !g.completed);
  const topGoal = activeGoals.sort((a, b) => b.progress - a.progress)[0];

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
          {topGoal ? (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{topGoal.icon}</div>
              <div style={{ fontFamily: "var(--font-d)", fontSize: 15, color: "var(--t1)" }}>{topGoal.name}</div>
              <div style={{ fontSize: 10, color: "var(--t3)", margin: "4px 0 12px" }}>{topGoal.deadline}</div>
              <div style={{ background: "var(--b1)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${topGoal.progress}%`, background: topGoal.color, borderRadius: 4 }} />
              </div>
              <div style={{ fontFamily: "var(--font-m)", fontSize: 20, color: topGoal.color, marginTop: 10 }}>{topGoal.progress}%</div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "40px 10px", marginTop: 20 }}>No active goals</div>
          )}
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
