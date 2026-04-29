import { MODES, fmtParts } from "../utils";

export function FocusPage({ mode, setMode, secs, setSecs, running, setRunning, sessions, setSessions, customWork, setCustomWork, customShort, setCustomShort, focusSessions, setFocusSessions, currentTask, setCurrentTask, currentCategory, setCurrentCategory }) {
  const total = mode === "work" ? customWork * 60 : mode === "short" ? customShort * 60 : 15 * 60;

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
          <div className="ring-wrap" style={{ marginBottom: 14, width: 180, height: 180 }}>
            <div className="ring-inner">
              <div className="ring-time">
                {(() => {
                  const [m, s] = fmtParts(secs);
                  return (
                    <>
                      <span>{m[0]}</span>
                      <span>{m[1]}</span>
                      <span className="colon">:</span>
                      <span>{s[0]}</span>
                      <span>{s[1]}</span>
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
