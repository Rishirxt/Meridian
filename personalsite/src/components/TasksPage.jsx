import { useState } from "react";
import { useLocalStorage, PRIO_COLORS, getTodayKey } from "../utils";

export function TasksPage() {
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
