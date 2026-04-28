import { memo } from "react";
import { useLocalStorage, NAV } from "../utils";

export const Sidebar = memo(({ page, setPage, sessions }) => {
  const [todos] = useLocalStorage("todos", []);
  const remaining = todos.filter(t => !t.done).length;
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-name">Meridian</div>
        <div className="brand-sub">Personal OS</div>
      </div>
      <nav className="nav">
        {NAV.map((n, i) =>
          n.section ? (
            <div key={i} className="nav-section">{n.section}</div>
          ) : (
            <div
              key={n.id}
              className={`nav-item ${page === n.id ? "active" : ""}`}
              onClick={() => setPage(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
              {n.badge && remaining > 0 && (
                <span className="nav-badge">{remaining}</span>
              )}
            </div>
          )
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="user-row">
          <div className="avatar">Y</div>
          <div>
            <div className="user-name">You</div>
            <div className="user-role">Personal OS</div>
          </div>
        </div>
      </div>
    </aside>
  );
});
