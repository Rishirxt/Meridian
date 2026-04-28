import { useLocalStorage, DEFAULT_HABITS, getTodayKey, getTodayIdx, DAYS_SHORT } from "../utils";

export function StatsPage({ focusSessions }) {
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
