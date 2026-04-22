import { useState, useEffect, useRef } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');`;

const MOODS = ["🌅 Morning", "⚡ Focused", "🌿 Calm", "🔥 Deep Work", "😴 Winding Down"];
const QUOTE_LIST = [
  { text: "Do the hard thing first.", author: "Brian Tracy" },
  { text: "One thing at a time.", author: "Seneca" },
  { text: "Clarity before speed.", author: "Unknown" },
  { text: "Rest is productive.", author: "Unknown" },
  { text: "Small steps, every day.", author: "Unknown" },
];

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : init;
    } catch {
      return init;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(val));
  }, [key, val]);
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

const NAV = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "todo", label: "Tasks", icon: "✓" },
  { id: "pomodoro", label: "Focus", icon: "◎" },
  { id: "habits", label: "Habits", icon: "▦" },
  { id: "notes", label: "Notes", icon: "≡" },
  { id: "stats", label: "Stats", icon: "↗" },
];

const MODES = {
  work: { label: "Focus", duration: 25 * 60 },
  short: { label: "Short Break", duration: 5 * 60 },
  long: { label: "Long Break", duration: 15 * 60 },
};

const STYLE_TAG = `
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
    body { 
      background: var(--bg); color: var(--text); font-family: var(--font-body); 
      overflow-x: hidden; user-select: none;
      scrollbar-width: none; -ms-overflow-style: none;
    }
    body::-webkit-scrollbar { display: none; }
    
    .app { display: flex; min-height: 100vh; }
    .sidebar {
      width: 220px; min-height: 100vh; background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex; flex-direction: column;
      padding: 2rem 0; position: fixed; top: 0; left: 0; z-index: 10;
      scrollbar-width: none;
    }
    .sidebar::-webkit-scrollbar { display: none; }

    .logo-container {
      padding: 0 1.5rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .logo-img {
      width: 48px;
      height: 48px;
      object-fit: contain;
      border-radius: 8px;
    }
    .logo-text {
      font-family: var(--font-display); font-size: 1.25rem;
      color: var(--accent);
      letter-spacing: 0.02em;
    }
    .logo-text span { display: block; font-size: 0.72rem; font-family: var(--font-body); color: var(--muted); font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 2px; }
    
    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 0.7rem 1.5rem; cursor: pointer;
      font-size: 0.9rem; font-weight: 400;
      color: var(--muted); border-left: 3px solid transparent;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); user-select: none;
    }
    .nav-item:hover { color: var(--text); background: rgba(255,255,255,0.03); }
    .nav-item.active { color: var(--accent); border-left-color: var(--accent); background: rgba(200,169,110,0.06); font-weight: 500; }
    .nav-icon { font-size: 1.1rem; width: 22px; text-align: center; }
    
    .main { margin-left: 220px; flex: 1; min-height: 100vh; background: linear-gradient(135deg, #0e0e10 0%, #121216 100%); }
    .page { padding: 3rem 4rem; max-width: 960px; margin: 0 auto; }

    .card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 1.75rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.3); }
    .card-sm { padding: 1.25rem 1.5rem; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; }

    h1 { font-family: var(--font-display); font-size: 2.5rem; font-weight: 400; color: var(--text); margin-bottom: 0.5rem; letter-spacing: -0.02em; }
    h2 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 400; color: var(--text); margin-bottom: 1.25rem; }
    h3 { font-size: 0.85rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem; }
    p { color: var(--muted); font-size: 0.95rem; line-height: 1.6; }

    input[type="text"], textarea, select {
      background: var(--surface2); border: 1px solid var(--border2);
      color: var(--text); border-radius: 10px; padding: 0.75rem 1rem;
      font-family: var(--font-body); font-size: 0.9rem; width: 100%;
      outline: none; transition: border-color 0.2s, box-shadow 0.2s;
      user-select: text;
    }
    input[type="text"]:focus, textarea:focus, select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(200,169,110,0.1); }
    textarea { resize: vertical; min-height: 140px; }
    input[type="checkbox"] { accent-color: var(--accent); width: 18px; height: 18px; cursor: pointer; }
    input[type="range"] { accent-color: var(--accent); width: 100%; cursor: pointer; height: 6px; border-radius: 3px; background: var(--border2); appearance: none; }
    input[type="range"]::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--accent); cursor: pointer; border: 2px solid var(--bg); }

    .btn {
      background: var(--accent); color: #0e0e10; border: none;
      border-radius: 10px; padding: 0.7rem 1.5rem;
      font-family: var(--font-body); font-size: 0.9rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn:hover { opacity: 0.9; transform: scale(1.02); }
    .btn:active { transform: scale(0.98); }
    
    .btn-ghost {
      background: transparent; color: var(--muted); border: 1px solid var(--border2);
      border-radius: 10px; padding: 0.6rem 1.2rem;
      font-family: var(--font-body); font-size: 0.88rem; cursor: pointer;
      transition: all 0.2s;
    }
    .btn-ghost:hover { color: var(--text); border-color: var(--accent); background: rgba(255,255,255,0.03); }
    .btn-danger { background: var(--danger); color: #fff; }
    .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.8rem; }

    .tag {
      display: inline-block; padding: 0.25rem 0.75rem;
      border-radius: 20px; font-size: 0.75rem; font-weight: 600;
      background: rgba(200,169,110,0.12); color: var(--accent);
    }
    .tag-green { background: rgba(92,138,110,0.15); color: var(--accent2); }
    .tag-red { background: rgba(176,82,82,0.15); color: #e07070; }

    .row { display: flex; align-items: center; gap: 1rem; }
    .between { justify-content: space-between; }
    .col { display: flex; flex-direction: column; gap: 1rem; }
    .mt1 { margin-top: 1rem; }
    .mt2 { margin-top: 2rem; }
    .mb1 { margin-bottom: 1rem; }

    .todo-item {
      display: flex; align-items: center; gap: 1rem;
      padding: 0.85rem 1.25rem; border-radius: 10px;
      background: var(--surface2); border: 1px solid var(--border);
      transition: all 0.2s;
    }
    .todo-item:hover { border-color: var(--accent); transform: translateX(4px); }
    .todo-item.done { opacity: 0.5; }
    .todo-text { flex: 1; font-size: 0.95rem; }
    .todo-text.done { text-decoration: line-through; color: var(--muted); }
    .del-btn { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 1.2rem; padding: 0 4px; transition: color 0.1s; }
    .del-btn:hover { color: var(--danger); }

    .timer-ring { position: relative; display: flex; align-items: center; justify-content: center; margin: 2rem 0; }
    .timer-display { font-family: var(--font-mono); font-size: 4.5rem; font-weight: 400; color: var(--text); letter-spacing: 0.05em; }
    .timer-label { font-size: 0.85rem; color: var(--muted); text-align: center; margin-top: 0.5rem; letter-spacing: 0.15em; text-transform: uppercase; }
    .mode-btn { padding: 0.5rem 1.25rem; border-radius: 20px; font-size: 0.85rem; cursor: pointer; border: 1px solid var(--border2); background: transparent; color: var(--muted); font-family: var(--font-body); transition: all 0.2s; }
    .mode-btn.active { background: rgba(200,169,110,0.15); color: var(--accent); border-color: var(--accent); }

    .habit-row { display: flex; align-items: center; gap: 1rem; padding: 0.85rem 1.25rem; border-radius: 10px; background: var(--surface2); border: 1px solid var(--border); }
    .habit-dots { display: flex; gap: 8px; margin-left: auto; }
    .dot { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--border2); cursor: pointer; transition: all 0.2s; }
    .dot.done { background: var(--accent2); border-color: var(--accent2); }
    .dot:hover { border-color: var(--accent); transform: scale(1.1); }

    .stat-num { font-family: var(--font-mono); font-size: 2.5rem; font-weight: 400; color: var(--accent); }
    .stat-label { font-size: 0.85rem; color: var(--muted); margin-top: 4px; }
    .bar-wrap { background: var(--surface2); border-radius: 6px; height: 8px; overflow: hidden; margin-top: 0.6rem; }
    .bar-fill { height: 100%; background: var(--accent); border-radius: 6px; transition: width 0.6s cubic-bezier(0.1, 0, 0, 1); }
    .bar-fill-green { background: var(--accent2); }

    .note-card { background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; cursor: pointer; transition: all 0.2s; }
    .note-card:hover { border-color: var(--accent); transform: translateY(-4px); }
    .note-title { font-size: 1rem; font-weight: 600; margin-bottom: 6px; }
    .note-preview { font-size: 0.85rem; color: var(--muted); line-height: 1.6; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
    .note-date { font-size: 0.75rem; color: var(--muted); margin-top: 12px; opacity: 0.7; }

    .mood-pill { padding: 0.4rem 1rem; border-radius: 25px; font-size: 0.85rem; cursor: pointer; border: 1px solid var(--border2); background: transparent; color: var(--muted); font-family: var(--font-body); transition: all 0.2s; }
    .mood-pill:hover { border-color: var(--accent); color: var(--text); }
    .mood-pill.active { background: rgba(200,169,110,0.15); color: var(--accent); border-color: var(--accent); }

    .ring-svg { transform: rotate(-90deg); filter: drop-shadow(0 0 8px rgba(200,169,110,0.2)); }
    .ring-track { fill: none; stroke: var(--surface2); }
    .ring-prog { fill: none; stroke: var(--accent); stroke-linecap: round; transition: stroke-dashoffset 0.5s; }

    @media (max-width: 800px) {
      .sidebar { width: 64px; }
      .sidebar .logo-container, .nav-item span:last-child { display: none; }
      .main { margin-left: 64px; }
      .page { padding: 2rem 1.5rem; }
      .grid2, .grid3 { grid-template-columns: 1fr; }
    }
  `;

export default function App() {
  const [page, setPage] = useState("home");
  const [mood, setMood] = useLocalStorage("mood", MOODS[0]);
  const [quote] = useState(QUOTE_LIST[Math.floor(Math.random() * QUOTE_LIST.length)]);

  // Pomodoro States
  const [pomMode, setPomMode] = useState("work");
  const [pomSeconds, setPomSeconds] = useState(MODES.work.duration);
  const [pomRunning, setPomRunning] = useState(false);
  const [sessions, setSessions] = useLocalStorage("pom_sessions", 0);
  const [customWork, setCustomWork] = useLocalStorage("pom_work", 25);
  const [customShort, setCustomShort] = useLocalStorage("pom_short", 5);
  const intervalRef = useRef(null);

  useEffect(() => {
    setPomSeconds(pomMode === "work" ? customWork * 60 : pomMode === "short" ? customShort * 60 : 15 * 60);
    setPomRunning(false);
  }, [pomMode, customWork, customShort]);

  useEffect(() => {
    if (pomRunning) {
      intervalRef.current = setInterval(() => {
        setPomSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setPomRunning(false);
            if (pomMode === "work") setSessions(p => p + 1);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [pomRunning, pomMode, setSessions]);

  const resetPomodoro = () => { 
    setPomRunning(false); 
    setPomSeconds(pomMode === "work" ? customWork * 60 : pomMode === "short" ? customShort * 60 : 15 * 60); 
  };

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);


  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE_TAG }} />

      <div className="app">
        <Sidebar page={page} setPage={setPage} />
        <main className="main">
          {page === "home" && <HomePage mood={mood} setMood={setMood} quote={quote} setPage={setPage} />}
          {page === "todo" && <TodoPage />}
          {page === "pomodoro" && (
            <PomodoroPage 
              mode={pomMode} setMode={setPomMode}
              seconds={pomSeconds} setSeconds={setPomSeconds}
              running={pomRunning} setRunning={setPomRunning}
              sessions={sessions} setSessions={setSessions}
              customWork={customWork} setCustomWork={setCustomWork}
              customShort={customShort} setCustomShort={setCustomShort}
              reset={resetPomodoro}
            />
          )}
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
      <div className="logo-container">
        <img src="/logo.png" alt="Meridian" className="logo-img" />
        <div className="logo-text">
          Meridian
          <span>Personal OS</span>
        </div>
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

function HomePage({ mood, setMood, quote, setPage }) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const [todos] = useLocalStorage("todos", []);
  const [sessions] = useLocalStorage("pom_sessions", 0);
  const doneCount = todos.filter(t => t.done).length;

  return (
    <div className="page">
      <div style={{ marginBottom: "2.5rem" }}>
        <h1>{greeting}.</h1>
        <p style={{ marginTop: "0.5rem", fontSize: "1rem" }}>{dateStr}</p>
      </div>

      <div className="card mb1" style={{ borderLeft: "4px solid var(--accent)", borderRadius: "0 16px 16px 0", background: "rgba(200,169,110,0.05)" }}>
        <p style={{ color: "var(--text)", fontStyle: "italic", fontSize: "1.1rem", lineHeight: 1.7 }}>"{quote.text}"</p>
        <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", fontWeight: "600" }}>— {quote.author}</p>
      </div>

      <div className="card mt2 mb1">
        <h3>Current Mode</h3>
        <div className="row" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
          {MOODS.map(m => (
            <button key={m} className={`mood-pill ${mood === m ? "active" : ""}`} onClick={() => setMood(m)}>{m}</button>
          ))}
        </div>
      </div>

      <div className="grid3 mt2">
        <div className="card card-sm" style={{ cursor: "pointer" }} onClick={() => setPage("todo")}>
          <div className="stat-num">{doneCount}/{todos.length}</div>
          <div className="stat-label">Tasks done today</div>
          <div className="bar-wrap">
            <div className="bar-fill" style={{ width: todos.length ? `${(doneCount / todos.length) * 100}%` : "0%" }} />
          </div>
        </div>
        <div className="card card-sm" style={{ cursor: "pointer" }} onClick={() => setPage("pomodoro")}>
          <div className="stat-num">{sessions}</div>
          <div className="stat-label">Focus sessions</div>
          <div className="bar-wrap">
            <div className="bar-fill bar-fill-green" style={{ width: `${Math.min(sessions / 8 * 100, 100)}%` }} />
          </div>
        </div>
        <div className="card card-sm" style={{ cursor: "pointer" }} onClick={() => setPage("habits")}>
          <div className="stat-num" style={{ color: "var(--accent2)" }}>Habits</div>
          <div className="stat-label">Track streaks</div>
          <div className="bar-wrap">
            <div className="bar-fill bar-fill-green" style={{ width: "60%" }} />
          </div>
        </div>
      </div>

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
      <div className="col mt1">
        {todos.slice(0, 3).map(t => (
          <div key={t.id} className={`todo-item ${t.done ? "done" : ""}`}>
            <input type="checkbox" checked={t.done}
              onChange={() => setTodos(todos.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} />
            <span className={`todo-text ${t.done ? "done" : ""}`}>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
      <p style={{ marginBottom: "2.5rem" }}>
        {todos.filter(t => !t.done).length} remaining · {todos.filter(t => t.done).length} done
      </p>

      <div className="card mb1">
        <div className="row">
          <input type="text" placeholder="What needs to be done?" value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            style={{ flex: 1 }} />
          <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: "auto" }}>
            <option value="high">⬆ High</option>
            <option value="normal">• Normal</option>
            <option value="low">⬇ Low</option>
          </select>
          <button className="btn" onClick={add}>Add</button>
        </div>
      </div>

      <div className="row mb1" style={{ gap: "0.75rem" }}>
        {["all", "active", "done"].map(f => (
          <button key={f} className={`mode-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button className="btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={clear}>Clear done</button>
      </div>

      <div className="col" style={{ gap: "0.75rem" }}>
        {filtered.length === 0 && <p style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>No tasks here.</p>}
        {filtered.map(t => (
          <div key={t.id} className={`todo-item ${t.done ? "done" : ""}`}>
            <div style={{ width: 4, height: 28, borderRadius: 2, background: PRIO_COLORS[t.priority], flexShrink: 0 }} />
            <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
            <span className={`todo-text ${t.done ? "done" : ""}`}>{t.text}</span>
            <span className="tag" style={{ fontSize: "0.7rem" }}>{t.priority}</span>
            <button className="del-btn" onClick={() => del(t.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// MODES moved to top

function PomodoroPage({ 
  mode, setMode, 
  seconds, setSeconds, 
  running, setRunning, 
  sessions, setSessions, 
  customWork, setCustomWork, 
  customShort, setCustomShort,
  reset
}) {
  return (
    <div className="page" style={{ textAlign: "center" }}>
      <h1 style={{ textAlign: "left" }}>Focus Timer</h1>
      <p style={{ marginBottom: "2.5rem", textAlign: "left" }}>Sessions completed today: <strong style={{ color: "var(--accent)" }}>{sessions}</strong></p>

      <div className="row mb1" style={{ gap: "0.75rem", justifyContent: "center" }}>
        {Object.entries(MODES).map(([k, v]) => (
          <button key={k} className={`mode-btn ${mode === k ? "active" : ""}`} onClick={() => setMode(k)}>{v.label}</button>
        ))}
      </div>

      <div className="card" style={{ padding: "3rem" }}>
        <div className="timer-content" style={{ margin: "1rem 0" }}>
          <div>
            <div className="timer-display">{formatTime(seconds)}</div>
            <div className="timer-label">{MODES[mode].label}</div>
          </div>
        </div>
        <div className="row mt2" style={{ justifyContent: "center", gap: "1.5rem" }}>
          <button className="btn-ghost" onClick={reset}>Reset</button>
          <button className="btn" style={{ minWidth: 120 }} onClick={() => setRunning(r => !r)}>{running ? "Pause" : "Start"}</button>
        </div>
      </div>

      <div className="card mt2">
        <h3 style={{ textAlign: "left" }}>Settings</h3>
        <div className="grid2" style={{ gap: "2rem" }}>
          <div>
            <div className="row between" style={{ marginBottom: "0.75rem" }}><span style={{ fontSize: "0.9rem" }}>Focus duration</span><span style={{ color: "var(--accent)" }}>{customWork}m</span></div>
            <input type="range" min={5} max={60} step={5} value={customWork} onChange={e => setCustomWork(+e.target.value)} />
          </div>
          <div>
            <div className="row between" style={{ marginBottom: "0.75rem" }}><span style={{ fontSize: "0.9rem" }}>Short break</span><span style={{ color: "var(--accent2)" }}>{customShort}m</span></div>
            <input type="range" min={1} max={15} step={1} value={customShort} onChange={e => setCustomShort(+e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}

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

  const toggle = (hid, day) => { const k = weekKey(hid, day); setDone(d => ({ ...d, [k]: !d[k] })); };
  const addHabit = () => { if (!newHabit.trim()) return; setHabits([...habits, { id: Date.now(), name: newHabit.trim(), icon: "•" }]); setNewHabit(""); };
  const delHabit = id => setHabits(habits.filter(h => h.id !== id));
  const streakCount = (hid) => { let s = 0; for (let d = todayIdx; d >= 0; d--) { if (done[weekKey(hid, d)]) s++; else break; } return s; };

  return (
    <div className="page">
      <h1>Habits</h1>
      <p style={{ marginBottom: "2rem" }}>Track your daily habits and build streaks.</p>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", paddingRight: "1.5rem" }}>
        <div style={{ flex: 1 }} />
        {DAYS.map((d, i) => (<div key={i} style={{ width: 32, textAlign: "center", fontSize: "0.8rem", color: i === todayIdx ? "var(--accent)" : "var(--muted)" }}>{d}</div>))}
        <div style={{ width: 32 }} />
      </div>
      <div className="col" style={{ gap: "0.75rem" }}>
        {habits.map(h => (
          <div key={h.id} className="habit-row">
            <span style={{ fontSize: "1.2rem", width: 24 }}>{h.icon}</span>
            <span style={{ fontSize: "1rem", flex: 1 }}>{h.name}</span>
            {streakCount(h.id) > 0 && <span className="tag-green tag">🔥 {streakCount(h.id)}</span>}
            <div className="habit-dots">
              {DAYS.map((_, i) => (<div key={i} className={`dot ${done[weekKey(h.id, i)] ? "done" : ""}`} onClick={() => toggle(h.id, i)} style={{ opacity: i > todayIdx ? 0.3 : 1 }} />))}
            </div>
            <button className="del-btn" onClick={() => delHabit(h.id)}>×</button>
          </div>
        ))}
      </div>
      <div className="card mt2">
        <h3>Add New Habit</h3>
        <div className="row"><input type="text" placeholder="e.g. Meditate 10 min" value={newHabit} onChange={e => setNewHabit(e.target.value)} onKeyDown={e => e.key === "Enter" && addHabit()} style={{ flex: 1 }} /><button className="btn" onClick={addHabit}>Add</button></div>
      </div>
    </div>
  );
}

function NotesPage() {
  const [notes, setNotes] = useLocalStorage("notes", []);
  const [active, setActive] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");

  const newNote = () => { const n = { id: Date.now(), title: "Untitled Note", body: "", date: new Date().toLocaleDateString() }; setNotes([n, ...notes]); setActive(n.id); setTitle(n.title); setBody(n.body); };
  const save = () => setNotes(notes.map(n => n.id === active ? { ...n, title: title || "Untitled Note", body } : n));
  const del = id => { setNotes(notes.filter(n => n.id !== id)); if (active === id) setActive(null); };
  const open = n => { setActive(n.id); setTitle(n.title); setBody(n.body); };

  const filtered = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page">
      <div className="row between mb1"><h1>Notes</h1><button className="btn" onClick={newNote}>+ Create New</button></div>
      <input type="text" placeholder="Search your notes..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: "1.5rem" }} />
      {active ? (
        <div className="card col">
          <div className="row between"><button className="btn-ghost btn-sm" onClick={() => { save(); setActive(null); }}>← Back</button><div className="row"><button className="btn btn-sm" onClick={save}>Save</button><button className="btn btn-sm btn-danger" onClick={() => del(active)}>Delete</button></div></div>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} style={{ fontSize: "1.5rem", border: "none", borderBottom: "1px solid var(--border2)", borderRadius: 0, padding: "0.75rem 0" }} />
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Start writing..." style={{ minHeight: 400 }} />
        </div>
      ) : (
        <div className="grid2"> {filtered.map(n => (<div key={n.id} className="note-card" onClick={() => open(n)}><div className="note-title">{n.title}</div><div className="note-preview">{n.body || "..."}</div><div className="note-date">{n.date}</div></div>))} </div>
      )}
    </div>
  );
}

function StatsPage() {
  const [todos] = useLocalStorage("todos", []);
  const [sessions] = useLocalStorage("pom_sessions", 0);
  const doneCount = todos.filter(t => t.done).length;
  const totalCount = todos.length;
  const focusHours = ((sessions * 25) / 60).toFixed(1);

  return (
    <div className="page">
      <h1>Stats</h1>
      <p style={{ marginBottom: "2.5rem" }}>Your productivity summary.</p>
      <div className="grid2">
        <div className="card">
          <h3>Tasks</h3>
          <div className="stat-num">{doneCount}</div><div className="stat-label">completed of {totalCount}</div>
          <div className="bar-wrap"><div className="bar-fill" style={{ width: totalCount ? `${(doneCount / totalCount) * 100}%` : "0%" }} /></div>
        </div>
        <div className="card">
          <h3>Focus</h3>
          <div className="stat-num">{focusHours}h</div><div className="stat-label">{sessions} sessions</div>
          <div className="bar-wrap"><div className="bar-fill bar-fill-green" style={{ width: `${Math.min(sessions / 8 * 100, 100)}%` }} /></div>
        </div>
      </div>
    </div>
  );
}
