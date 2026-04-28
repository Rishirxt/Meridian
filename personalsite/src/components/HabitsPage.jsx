import { useState } from "react";
import { useLocalStorage, DEFAULT_HABITS, getTodayIdx, getTodayKey, DAYS_SHORT } from "../utils";

export function HabitsPage() {
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
