import { useState } from "react";
import { useLocalStorage } from "../utils";

const NOTE_COLORS = ["var(--gold)", "var(--jade)", "var(--rose)", "var(--indigo)"];
const NOTE_TAGS = ["General", "Physics", "Math", "Chemistry", "English", "Planning"];

export function NotesPage() {
  const [notes, setNotes] = useLocalStorage("notes", []);
  const [active, setActive] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [noteTag, setNoteTag] = useState("General");
  const [tab, setTab] = useState(0);

  const newNote = () => {
    const n = {
      id: Date.now(), title: "Untitled Note", body: "",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      tag: "General", color: NOTE_COLORS[0],
    };
    setNotes([n, ...notes]);
    setActive(n.id); setTitle(n.title); setBody(n.body); setNoteTag(n.tag);
  };
  const save = () => setNotes(notes.map(n => n.id === active ? { ...n, title: title || "Untitled", body, tag: noteTag } : n));
  const del = id => { setNotes(notes.filter(n => n.id !== id)); if (active === id) setActive(null); };
  const open = n => { setActive(n.id); setTitle(n.title); setBody(n.body); setNoteTag(n.tag); };

  const filtered = notes.filter(n => {
    const q = search.toLowerCase();
    const matchQ = n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
    const matchTab = tab === 0 ? true : n.tag === NOTE_TAGS[tab];
    return matchQ && matchTab;
  });

  if (active) {
    const note = notes.find(n => n.id === active);
    return (
      <div>
        <div className="panel col">
          <div className="row between">
            <button className="btn-ghost btn-sm" onClick={() => { save(); setActive(null); }}>← Back</button>
            <div className="row">
              <select className="inp" value={noteTag} onChange={e => setNoteTag(e.target.value)} style={{ width: 110 }}>
                {NOTE_TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
              <button className="btn btn-sm" onClick={save}>Save</button>
              <button className="btn btn-sm btn-danger" onClick={() => del(active)}>Delete</button>
            </div>
          </div>
          <input className="inp" value={title} onChange={e => setTitle(e.target.value)}
            style={{ fontSize: "1.3rem", border: "none", borderBottom: "1px solid var(--b2)", borderRadius: 0, padding: "8px 0", background: "transparent" }} />
          <textarea className="inp" value={body} onChange={e => setBody(e.target.value)}
            placeholder="Start writing..." style={{ minHeight: 400, background: "transparent", border: "none", borderRadius: 0, padding: "8px 0", resize: "vertical" }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Notes</div><div className="page-sub">{notes.length} notes</div></div>
        <button className="btn" onClick={newNote}>+ New Note</button>
      </div>
      <input className="inp" placeholder="Search notes..." value={search}
        onChange={e => setSearch(e.target.value)} style={{ marginBottom: 14 }} />
      <div className="tabs">
        {NOTE_TAGS.map((t, i) => (
          <div key={t} className={`tab ${tab === i ? "active" : ""}`} onClick={() => setTab(i)}>{t}</div>
        ))}
      </div>
      <div className="note-grid">
        {filtered.map(n => (
          <div key={n.id} className="note-item" style={{ "--note-color": n.color }} onClick={() => open(n)}>
            <div className="note-title">{n.title}</div>
            <div className="note-prev">{n.body || "Empty note..."}</div>
            <div className="note-tag" style={{ background: `color-mix(in srgb, ${n.color} 15%, transparent)`, color: n.color }}>{n.tag}</div>
            <div className="note-date">{n.date}</div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="empty-state">No notes found. Create one above.</div>}
    </div>
  );
}
