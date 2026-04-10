import { useState, useEffect, useRef, useCallback } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');`;

const MOODS = ["🌅 Morning", "⚡ Focused", "🌿 Calm", "🔥 Deep Work", "😴 Winding Down"];
const QUOTE_LIST = [
  { text: "Do the hard thing first.", author: "Brian Tracy" },
  { text: "One thing at a time.", author: "Seneca" },
  { text: "Clarity before speed.", author: "Unknown" },
  { text: "Rest is productive.", author: "Unknown" },
  { text: "Small steps, every day.", author: "Unknown" },
];

const SOUND_OPTIONS = ["None", "Rain", "Coffee Shop", "White Noise"];

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? init; }
    catch { return init; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal];
}

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Sidebar Nav ─────────────────────────────────────────────────────────────
const NAV = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "todo", label: "Tasks", icon: "✓" },
  { id: "pomodoro", label: "Focus", icon: "◎" },
  { id: "habits", label: "Habits", icon: "▦" },
  { id: "notes", label: "Notes", icon: "≡" },
  { id: "stats", label: "Stats", icon: "↗" },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [mood, setMood] = useLocalStorage("mood", MOODS[0]);
  const [quote] = useState(QUOTE_LIST[Math.floor(Math.random() * QUOTE_LIST.length)]);

  return (
    <>
      <style>{`
        ${FONTS}
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0e0e10;
          --surface: #18181c;
          --surface2: #222228;
          --border: rgba(255,255,255,0.07);
          --border2: rgba(255,255,255,0.13);
          --text: #f0ede6;
          --muted: #8a8780;
          --accent: #c8a96e;
          --accent2: #5c8a6e;
          --danger: #b05252;
          --radius: 12px;
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body: 'DM Sans', sans-serif;
          --font-mono: 'DM Mono', monospace;
        }
        body { background: var(--bg); color: var(--text); font-family: var(--font-body); }
        .app { display: flex; min-height: 100vh; }
        .sidebar {
          width: 200px; min-height: 100vh; background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          padding: 2rem 0; position: fixed; top: 0; left: 0; z-index: 10;
        }
        .logo {
          font-family: var(--font-display); font-size: 1.15rem;
          color: var(--accent); padding: 0 1.5rem 2rem;
          letter-spacing: 0.02em;
        }
        .logo span { display: block; font-size: 0.72rem; font-family: var(--font-body); color: var(--muted); font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 2px; }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 0.6rem 1.5rem; cursor: pointer;
          font-size: 0.88rem; font-weight: 400;
          color: var(--muted); border-left: 2px solid transparent;
          transition: all 0.15s; user-select: none;
        }
        .nav-item:hover { color: var(--text); background: rgba(255,255,255,0.03); }
        .nav-item.active { color: var(--accent); border-left-color: var(--accent); background: rgba(200,169,110,0.05); font-weight: 500; }
        .nav-icon { font-size: 1rem; width: 20px; text-align: center; }
        .main { margin-left: 200px; flex: 1; min-height: 100vh; }
        .page { padding: 2.5rem 3rem; max-width: 860px; }

        /* Cards */
        .card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 1.5rem;
        }
        .card-sm { padding: 1rem 1.25rem; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }

        /* Typography */
        h1 { font-family: var(--font-display); font-size: 2rem; font-weight: 400; color: var(--text); margin-bottom: 0.25rem; }
        h2 { font-family: var(--font-display); font-size: 1.35rem; font-weight: 400; color: var(--text); margin-bottom: 1rem; }
        h3 { font-size: 0.8rem; font-weight: 500; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem; }
        p { color: var(--muted); font-size: 0.9rem; line-height: 1.6; }

        /* Inputs */
        input[type="text"], textarea {
          background: var(--surface2); border: 1px solid var(--border2);
          color: var(--text); border-radius: 8px; padding: 0.6rem 0.85rem;
          font-family: var(--font-body); font-size: 0.88rem; width: 100%;
          outline: none; transition: border 0.15s;
        }
        input[type="text"]:focus, textarea:focus { border-color: var(--accent); }
        textarea { resize: vertical; min-height: 120px; }
        input[type="checkbox"] { accent-color: var(--accent); width: 15px; height: 15px; cursor: pointer; }
        input[type="range"] { accent-color: var(--accent); width: 100%; cursor: pointer; }

        /* Buttons */
        .btn {
          background: var(--accent); color: #0e0e10; border: none;
          border-radius: 8px; padding: 0.55rem 1.2rem;
          font-family: var(--font-body); font-size: 0.85rem; font-weight: 500;
          cursor: pointer; transition: opacity 0.15s;
        }
        .btn:hover { opacity: 0.85; }
        .btn-ghost {
          background: transparent; color: var(--muted); border: 1px solid var(--border2);
          border-radius: 8px; padding: 0.5rem 1rem;
          font-family: var(--font-body); font-size: 0.82rem; cursor: pointer;
          transition: all 0.15s;
        }
        .btn-ghost:hover { color: var(--text); border-color: var(--border2); }
        .btn-danger { background: var(--danger); color: #fff; }
        .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.78rem; }

        /* Tag */
        .tag {
          display: inline-block; padding: 0.2rem 0.6rem;
          border-radius: 6px; font-size: 0.72rem; font-weight: 500;
          background: rgba(200,169,110,0.12); color: var(--accent);
        }
        .tag-green { background: rgba(92,138,110,0.15); color: var(--accent2); }
        .tag-red { background: rgba(176,82,82,0.15); color: #e07070; }

        /* Row utils */
        .row { display: flex; align-items: center; gap: 0.75rem; }
        .between { justify-content: space-between; }
        .col { display: flex; flex-direction: column; gap: 0.75rem; }
        .mt1 { margin-top: 0.75rem; }
        .mt2 { margin-top: 1.5rem; }
        .mb1 { margin-bottom: 0.75rem; }

        /* Todo item */
        .todo-item {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.65rem 1rem; border-radius: 8px;
          background: var(--surface2); border: 1px solid var(--border);
          transition: all 0.15s;
        }
        .todo-item:hover { border-color: var(--border2); }
        .todo-item.done { opacity: 0.45; }
        .todo-text { flex: 1; font-size: 0.88rem; }
        .todo-text.done { text-decoration: line-through; color: var(--muted); }
        .del-btn { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 1rem; padding: 0 4px; transition: color 0.1s; }
        .del-btn:hover { color: var(--danger); }

        /* Pomodoro */
        .timer-ring { position: relative; display: flex; align-items: center; justify-content: center; }
        .timer-display {
          font-family: var(--font-mono); font-size: 3.5rem; font-weight: 400;
          color: var(--text); letter-spacing: 0.05em;
        }
        .timer-label { font-size: 0.78rem; color: var(--muted); text-align: center; margin-top: 0.4rem; letter-spacing: 0.1em; text-transform: uppercase; }
        .mode-btn {
          padding: 0.4rem 1rem; border-radius: 6px; font-size: 0.78rem; cursor: pointer;
          border: 1px solid var(--border2); background: transparent; color: var(--muted);
          font-family: var(--font-body); transition: all 0.15s;
        }
        .mode-btn.active { background: rgba(200,169,110,0.12); color: var(--accent); border-color: rgba(200,169,110,0.25); }

        /* Habits */
        .habit-row {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.6rem 1rem; border-radius: 8px;
          background: var(--surface2); border: 1px solid var(--border);
        }
        .habit-dots { display: flex; gap: 5px; margin-left: auto; }
        .dot {
          width: 18px; height: 18px; border-radius: 50%;
          border: 1px solid var(--border2); cursor: pointer; transition: all 0.1s;
        }
        .dot.done { background: var(--accent2); border-color: var(--accent2); }
        .dot:hover { border-color: var(--accent); }

        /* Stats */
        .stat-num { font-family: var(--font-mono); font-size: 2rem; font-weight: 400; color: var(--accent); }
        .stat-label { font-size: 0.78rem; color: var(--muted); margin-top: 2px; }
        .bar-wrap { background: var(--surface2); border-radius: 4px; height: 6px; overflow: hidden; margin-top: 0.4rem; }
        .bar-fill { height: 100%; background: var(--accent); border-radius: 4px; transition: width 0.4s; }
        .bar-fill-green { background: var(--accent2); }

        /* Notes */
        .note-card {
          background: var(--surface2); border: 1px solid var(--border);
          border-radius: 10px; padding: 1rem; cursor: pointer;
          transition: border 0.15s;
        }
        .note-card:hover { border-color: var(--border2); }
        .note-title { font-size: 0.9rem; font-weight: 500; margin-bottom: 4px; }
        .note-preview { font-size: 0.78rem; color: var(--muted); line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        .note-date { font-size: 0.7rem; color: var(--muted); margin-top: 8px; }

        /* Mood selector */
        .mood-pill {
          padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.78rem; cursor: pointer;
          border: 1px solid var(--border2); background: transparent; color: var(--muted);
          font-family: var(--font-body); transition: all 0.15s;
        }
        .mood-pill.active { background: rgba(200,169,110,0.1); color: var(--accent); border-color: rgba(200,169,110,0.25); }

        /* Progress ring */
        .ring-svg { transform: rotate(-90deg); }
        .ring-track { fill: none; stroke: var(--surface2); }
        .ring-prog { fill: none; stroke: var(--accent); stroke-linecap: round; transition: stroke-dashoffset 0.5s; }

        @media (max-width: 700px) {
          .sidebar { width: 56px; }
          .sidebar .logo, .nav-item span { display: none; }
          .main { margin-left: 56px; }
          .page { padding: 1.5rem 1rem; }
          .grid2, .grid3 { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="app">
        <Sidebar page={page} setPage={setPage} />
        <main className="main">
          {page === "home" && <HomePage mood={mood} setMood={setMood} quote={quote} setPage={setPage} />}
          {page === "todo" && <TodoPage />}
          {page === "pomodoro" && <PomodoroPage />}
          {page === "habits" && <HabitsPage />}
          {page === "notes" && <NotesPage />}
          {page === "stats" && <StatsPage />}
        </main>
      </div>
    </>
  );
}

function Sidebar({ page, setPage }) {
  return (
    <aside className="sidebar">
      <div className="logo">
        Meridian
        <span>Personal OS</span>
      </div>
      {NAV.map(n => (
        <div
          key={n.id}
          className={`nav-item ${page === n.id ? "active" : ""}`}
          onClick={() => setPage(n.id)}
        >
          <span className="nav-icon">{n.icon}</span>
          <span>{n.label}</span>
        </div>
      ))}
    </aside>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ mood, setMood, quote, setPage }) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const [todos] = useLocalStorage("todos", []);
  const [sessions] = useLocalStorage("pom_sessions", 0);
  const done = todos.filter(t => t.done).length;

  return (
    <div className="page">
      <div style={{ marginBottom: "2rem" }}>
        <h1>{greeting}.</h1>
        <p style={{ marginTop: "0.25rem", fontSize: "0.9rem" }}>{dateStr}</p>
      </div>

      {/* Quote */}
      <div className="card mb1" style={{ borderLeft: "3px solid var(--accent)", borderRadius: "0 12px 12px 0", background: "rgba(200,169,110,0.04)" }}>
        <p style={{ color: "var(--text)", fontStyle: "italic", fontSize: "1rem", lineHeight: 1.6 }}>"{quote.text}"</p>
        <p style={{ marginTop: "0.4rem", fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>— {quote.author}</p>
      </div>

      {/* Mood */}
      <div className="card mt2 mb1">
        <h3>Current Mode</h3>
        <div className="row" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
          {MOODS.map(m => (
            <button key={m} className={`mood-pill ${mood === m ? "active" : ""}`} onClick={() => setMood(m)}>{m}</button>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid3 mt2">
        <div className="card card-sm" style={{ cursor: "pointer" }} onClick={() => setPage("todo")}>
          <div className="stat-num">{done}/{todos.length}</div>
          <div className="stat-label">Tasks done today</div>
          <div className="bar-wrap" style={{ marginTop: "0.6rem" }}>
            <div className="bar-fill" style={{ width: todos.length ? `${(done / todos.length) * 100}%` : "0%" }} />
          </div>
        </div>
        <div className="card card-sm" style={{ cursor: "pointer" }} onClick={() => setPage("pomodoro")}>
          <div className="stat-num">{sessions}</div>
          <div className="stat-label">Focus sessions</div>
          <div className="bar-wrap" style={{ marginTop: "0.6rem" }}>
            <div className="bar-fill bar-fill-green" style={{ width: `${Math.min(sessions / 8 * 100, 100)}%` }} />
          </div>
        </div>
        <div className="card card-sm" style={{ cursor: "pointer" }} onClick={() => setPage("habits")}>
          <div className="stat-num" style={{ color: "var(--accent2)" }}>Habits</div>
          <div className="stat-label">Track streaks</div>
          <div className="bar-wrap" style={{ marginTop: "0.6rem" }}>
            <div className="bar-fill bar-fill-green" style={{ width: "40%" }} />
          </div>
        </div>
      </div>

      {/* Quick add task */}
      <QuickTodo />
    </div>
  );
}

function QuickTodo() {
  const [todos, setTodos] = useLocalStorage("todos", []);
  const [text, setText] = useState("");
  const add = () => {
    if (!text.trim()) return;
    setTodos([{ id: Date.now(), text: text.trim(), done: false, priority: "normal", date: getTodayKey() }, ...todos]);
    setText("");
  };
  return (
    <div className="card mt2">
      <h3>Quick Task</h3>
      <div className="row">
        <input type="text" placeholder="Add a task..." value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          style={{ flex: 1 }} />
        <button className="btn" onClick={add}>Add</button>
      </div>
      {todos.slice(0, 3).map(t => (
        <div key={t.id} className={`todo-item mt1 ${t.done ? "done" : ""}`}>
          <input type="checkbox" checked={t.done}
            onChange={() => setTodos(todos.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} />
          <span className={`todo-text ${t.done ? "done" : ""}`}>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

// ─── TODO PAGE ────────────────────────────────────────────────────────────────
function TodoPage() {
  const [todos, setTodos] = useLocalStorage("todos", []);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("normal");
  const [filter, setFilter] = useState("all");

  const add = () => {
    if (!text.trim()) return;
    setTodos([{ id: Date.now(), text: text.trim(), done: false, priority, date: getTodayKey() }, ...todos]);
    setText(""); setPriority("normal");
  };
  const toggle = id => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const del = id => setTodos(todos.filter(t => t.id !== id));
  const clear = () => setTodos(todos.filter(t => !t.done));

  const filtered = todos.filter(t =>
    filter === "all" ? true : filter === "active" ? !t.done : t.done
  );
  const PRIO_COLORS = { high: "var(--danger)", normal: "var(--accent)", low: "var(--muted)" };

  return (
    <div className="page">
      <h1>Tasks</h1>
      <p style={{ marginBottom: "1.5rem" }}>
        {todos.filter(t => !t.done).length} remaining · {todos.filter(t => t.done).length} done
      </p>

      <div className="card mb1">
        <div className="row">
          <input type="text" placeholder="What needs to be done?" value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            style={{ flex: 1 }} />
          <select value={priority} onChange={e => setPriority(e.target.value)}
            style={{ background: "var(--surface2)", border: "1px solid var(--border2)", color: "var(--text)", borderRadius: "8px", padding: "0.6rem 0.75rem", fontFamily: "var(--font-body)", fontSize: "0.82rem", cursor: "pointer" }}>
            <option value="high">⬆ High</option>
            <option value="normal">• Normal</option>
            <option value="low">⬇ Low</option>
          </select>
          <button className="btn" onClick={add}>Add</button>
        </div>
      </div>

      <div className="row mb1" style={{ gap: "0.5rem" }}>
        {["all", "active", "done"].map(f => (
          <button key={f} className={`mode-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button className="btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={clear}>Clear done</button>
      </div>

      <div className="col" style={{ gap: "0.5rem" }}>
        {filtered.length === 0 && <p style={{ textAlign: "center", padding: "2rem" }}>No tasks here.</p>}
        {filtered.map(t => (
          <div key={t.id} className={`todo-item ${t.done ? "done" : ""}`}>
            <div style={{ width: 3, height: 24, borderRadius: 2, background: PRIO_COLORS[t.priority], flexShrink: 0 }} />
            <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
            <span className={`todo-text ${t.done ? "done" : ""}`}>{t.text}</span>
            <span className="tag" style={{ fontSize: "0.68rem" }}>{t.priority}</span>
            <button className="del-btn" onClick={() => del(t.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── POMODORO PAGE ────────────────────────────────────────────────────────────
const MODES = {
  work: { label: "Focus", duration: 25 * 60 },
  short: { label: "Short Break", duration: 5 * 60 },
  long: { label: "Long Break", duration: 15 * 60 },
};

function PomodoroPage() {
  const [mode, setMode] = useState("work");
  const [seconds, setSeconds] = useState(MODES.work.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useLocalStorage("pom_sessions", 0);
  const [customWork, setCustomWork] = useLocalStorage("pom_work", 25);
  const [customShort, setCustomShort] = useLocalStorage("pom_short", 5);
  const intervalRef = useRef(null);

  const total = mode === "work" ? customWork * 60 : mode === "short" ? customShort * 60 : 15 * 60;
  const progress = 1 - seconds / total;
  const R = 80; const C = 2 * Math.PI * R;

  useEffect(() => {
    setSeconds(mode === "work" ? customWork * 60 : mode === "short" ? customShort * 60 : 15 * 60);
    setRunning(false);
  }, [mode, customWork, customShort]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "work") setSessions(p => p + 1);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const reset = () => {
    setRunning(false);
    setSeconds(mode === "work" ? customWork * 60 : mode === "short" ? customShort * 60 : 15 * 60);
  };

  return (
    <div className="page">
      <h1>Focus Timer</h1>
      <p style={{ marginBottom: "2rem" }}>Sessions completed today: <strong style={{ color: "var(--accent)" }}>{sessions}</strong></p>

      <div className="row mb1" style={{ gap: "0.5rem" }}>
        {Object.entries(MODES).map(([k, v]) => (
          <button key={k} className={`mode-btn ${mode === k ? "active" : ""}`} onClick={() => setMode(k)}>{v.label}</button>
        ))}
      </div>

      <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
        <div className="timer-ring">
          <svg width={200} height={200} className="ring-svg" style={{ position: "absolute" }}>
            <circle className="ring-track" cx={100} cy={100} r={R} strokeWidth={5} />
            <circle className="ring-prog" cx={100} cy={100} r={R} strokeWidth={5}
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)} />
          </svg>
          <div>
            <div className="timer-display">{formatTime(seconds)}</div>
            <div className="timer-label">{MODES[mode].label}</div>
          </div>
        </div>

        <div className="row mt2" style={{ justifyContent: "center", gap: "1rem" }}>
          <button className="btn-ghost" onClick={reset}>Reset</button>
          <button className="btn" style={{ minWidth: 90 }} onClick={() => setRunning(r => !r)}>
            {running ? "Pause" : "Start"}
          </button>
        </div>
      </div>

      <div className="card mt2">
        <h3>Customize</h3>
        <div className="grid2" style={{ gap: "1.25rem" }}>
          <div>
            <div className="row between" style={{ marginBottom: "0.4rem" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Focus duration</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.88rem", color: "var(--accent)" }}>{customWork}m</span>
            </div>
            <input type="range" min={5} max={60} step={5} value={customWork} onChange={e => setCustomWork(+e.target.value)} />
          </div>
          <div>
            <div className="row between" style={{ marginBottom: "0.4rem" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Short break</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.88rem", color: "var(--accent2)" }}>{customShort}m</span>
            </div>
            <input type="range" min={1} max={15} step={1} value={customShort} onChange={e => setCustomShort(+e.target.value)} />
          </div>
        </div>
      </div>

      {/* Session log */}
      <div className="card mt2">
        <h3>Today's Pomodoros</h3>
        <div className="row" style={{ flexWrap: "wrap", gap: "6px" }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{
              width: 28, height: 28, borderRadius: 6,
              background: i < sessions % 8 ? "var(--accent)" : "var(--surface2)",
              border: `1px solid ${i < sessions % 8 ? "var(--accent)" : "var(--border2)"}`,
              transition: "all 0.2s"
            }} />
          ))}
          <span style={{ fontSize: "0.78rem", color: "var(--muted)", alignSelf: "center", marginLeft: "0.5rem" }}>
            {sessions} total
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── HABITS PAGE ─────────────────────────────────────────────────────────────
const DEFAULT_HABITS = [
  { id: 1, name: "Morning pages", icon: "✍" },
  { id: 2, name: "Exercise", icon: "⚡" },
  { id: 3, name: "Read 20 min", icon: "📖" },
  { id: 4, name: "No phone before 9am", icon: "🚫" },
];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function HabitsPage() {
  const [habits, setHabits] = useLocalStorage("habits", DEFAULT_HABITS);
  const [done, setDone] = useLocalStorage("habit_done", {});
  const [newHabit, setNewHabit] = useState("");

  const todayIdx = (new Date().getDay() + 6) % 7;
  const weekKey = (hid, day) => `${hid}-${getTodayKey()}-${day}`;

  const toggle = (hid, day) => {
    const k = weekKey(hid, day);
    setDone(d => ({ ...d, [k]: !d[k] }));
  };
  const addHabit = () => {
    if (!newHabit.trim()) return;
    setHabits([...habits, { id: Date.now(), name: newHabit.trim(), icon: "•" }]);
    setNewHabit("");
  };
  const delHabit = id => setHabits(habits.filter(h => h.id !== id));

  const streak = (hid) => {
    let s = 0;
    for (let d = todayIdx; d >= 0; d--) {
      if (done[weekKey(hid, d)]) s++; else break;
    }
    return s;
  };

  return (
    <div className="page">
      <h1>Habits</h1>
      <p style={{ marginBottom: "1.5rem" }}>Track your daily habits and build streaks.</p>

      {/* Week header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", paddingRight: "1rem" }}>
        <div style={{ flex: 1 }} />
        {DAYS.map((d, i) => (
          <div key={i} style={{
            width: 28, textAlign: "center", fontSize: "0.72rem", fontWeight: 500,
            color: i === todayIdx ? "var(--accent)" : "var(--muted)",
          }}>{d}</div>
        ))}
        <div style={{ width: 28 }} />
      </div>

      <div className="col" style={{ gap: "0.5rem" }}>
        {habits.map(h => (
          <div key={h.id} className="habit-row">
            <span style={{ fontSize: "1rem", width: 22 }}>{h.icon}</span>
            <span style={{ fontSize: "0.88rem", flex: 1 }}>{h.name}</span>
            {streak(h.id) > 0 && <span className="tag-green tag" style={{ fontSize: "0.68rem" }}>🔥 {streak(h.id)}</span>}
            <div className="habit-dots">
              {DAYS.map((_, i) => (
                <div key={i} className={`dot ${done[weekKey(h.id, i)] ? "done" : ""} ${i === todayIdx ? "" : ""}`}
                  onClick={() => toggle(h.id, i)}
                  style={{ opacity: i > todayIdx ? 0.3 : 1 }}
                />
              ))}
            </div>
            <button className="del-btn" onClick={() => delHabit(h.id)}>×</button>
          </div>
        ))}
      </div>

      <div className="card mt2">
        <h3>Add Habit</h3>
        <div className="row">
          <input type="text" placeholder="e.g. Meditate 10 min" value={newHabit}
            onChange={e => setNewHabit(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addHabit()} style={{ flex: 1 }} />
          <button className="btn" onClick={addHabit}>Add</button>
        </div>
      </div>
    </div>
  );
}

// ─── NOTES PAGE ────────────────────────────────────────────────────────────────
function NotesPage() {
  const [notes, setNotes] = useLocalStorage("notes", []);
  const [active, setActive] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");

  const newNote = () => {
    const n = { id: Date.now(), title: "Untitled", body: "", date: new Date().toLocaleDateString() };
    setNotes([n, ...notes]);
    setActive(n.id); setTitle(n.title); setBody(n.body);
  };
  const save = () => {
    setNotes(notes.map(n => n.id === active ? { ...n, title: title || "Untitled", body } : n));
  };
  const del = id => { setNotes(notes.filter(n => n.id !== id)); if (active === id) setActive(null); };
  const open = n => { setActive(n.id); setTitle(n.title); setBody(n.body); };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.body.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="row between mb1">
        <h1>Notes</h1>
        <button className="btn" onClick={newNote}>+ New</button>
      </div>

      <input type="text" placeholder="Search notes..." value={search}
        onChange={e => setSearch(e.target.value)} style={{ marginBottom: "1rem" }} />

      {active ? (
        <div className="card col">
          <div className="row between">
            <button className="btn-ghost btn-sm" onClick={() => { save(); setActive(null); }}>← Back</button>
            <div className="row" style={{ gap: "0.5rem" }}>
              <button className="btn btn-sm" onClick={save}>Save</button>
              <button className="btn btn-sm btn-danger" onClick={() => del(active)}>Delete</button>
            </div>
          </div>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            style={{ fontSize: "1.1rem", fontWeight: 500, background: "transparent", border: "none", borderBottom: "1px solid var(--border2)", borderRadius: 0, padding: "0.5rem 0" }} />
          <textarea value={body} onChange={e => setBody(e.target.value)}
            placeholder="Start writing..." style={{ minHeight: 300, background: "var(--surface2)", border: "1px solid var(--border)" }} />
        </div>
      ) : (
        <div className="grid2" style={{ gap: "0.75rem" }}>
          {filtered.length === 0 && <p>No notes yet. Create one!</p>}
          {filtered.map(n => (
            <div key={n.id} className="note-card" onClick={() => open(n)}>
              <div className="note-title">{n.title}</div>
              <div className="note-preview">{n.body || "Empty note"}</div>
              <div className="note-date">{n.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── STATS PAGE ───────────────────────────────────────────────────────────────
function StatsPage() {
  const [todos] = useLocalStorage("todos", []);
  const [sessions] = useLocalStorage("pom_sessions", 0);
  const [notes] = useLocalStorage("notes", []);
  const [habits] = useLocalStorage("habits", DEFAULT_HABITS);

  const done = todos.filter(t => t.done).length;
  const total = todos.length;
  const focusHours = ((sessions * 25) / 60).toFixed(1);

  return (
    <div className="page">
      <h1>Stats</h1>
      <p style={{ marginBottom: "1.5rem" }}>Your productivity at a glance.</p>

      <div className="grid2">
        <div className="card">
          <h3>Tasks</h3>
          <div className="stat-num">{done}</div>
          <div className="stat-label">completed of {total}</div>
          <div className="bar-wrap" style={{ marginTop: "1rem" }}>
            <div className="bar-fill" style={{ width: total ? `${(done / total) * 100}%` : "0%" }} />
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.78rem", color: "var(--muted)" }}>
            {total ? Math.round((done / total) * 100) : 0}% completion rate
          </div>
        </div>

        <div className="card">
          <h3>Focus Time</h3>
          <div className="stat-num" style={{ color: "var(--accent2)" }}>{focusHours}h</div>
          <div className="stat-label">{sessions} pomodoro sessions</div>
          <div className="bar-wrap" style={{ marginTop: "1rem" }}>
            <div className="bar-fill bar-fill-green" style={{ width: `${Math.min(sessions / 8 * 100, 100)}%` }} />
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.78rem", color: "var(--muted)" }}>
            Goal: 8 sessions/day
          </div>
        </div>
      </div>

      <div className="grid3 mt2">
        <div className="card card-sm">
          <div className="stat-num" style={{ fontSize: "1.5rem" }}>{notes.length}</div>
          <div className="stat-label">Notes saved</div>
        </div>
        <div className="card card-sm">
          <div className="stat-num" style={{ fontSize: "1.5rem", color: "var(--accent2)" }}>{habits.length}</div>
          <div className="stat-label">Habits tracked</div>
        </div>
        <div className="card card-sm">
          <div className="stat-num" style={{ fontSize: "1.5rem" }}>{total - done}</div>
          <div className="stat-label">Tasks remaining</div>
        </div>
      </div>

      <div className="card mt2">
        <h3>Task Breakdown</h3>
        {[
          { label: "High priority", count: todos.filter(t => t.priority === "high").length, color: "var(--danger)" },
          { label: "Normal priority", count: todos.filter(t => t.priority === "normal").length, color: "var(--accent)" },
          { label: "Low priority", count: todos.filter(t => t.priority === "low").length, color: "var(--muted)" },
        ].map(row => (
          <div key={row.label} style={{ marginBottom: "0.75rem" }}>
            <div className="row between" style={{ marginBottom: "0.3rem" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{row.label}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: row.color }}>{row.count}</span>
            </div>
            <div className="bar-wrap">
              <div style={{ height: "100%", borderRadius: 4, background: row.color, width: total ? `${(row.count / total) * 100}%` : "0%", transition: "width 0.4s" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}