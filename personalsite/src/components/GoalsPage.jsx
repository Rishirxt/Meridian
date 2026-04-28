import { useState } from "react";
import { useLocalStorage, DEFAULT_GOALS } from "../utils";

export function GoalsPage() {
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
