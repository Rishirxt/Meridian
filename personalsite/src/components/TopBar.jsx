import { memo } from "react";

const PAGE_TITLES = {
  home: "Dashboard", goals: "Goals",
  tasks: "Tasks", focus: "Focus Timer",
  habits: "Habits", notes: "Notes", stats: "Analytics",
};

export const TopBar = memo(({ dateStr, mood, page }) => {
  return (
    <div className="topbar">
      <div className="topbar-title">{PAGE_TITLES[page] || page}</div>
      <div className="topbar-date">{dateStr}</div>
      <div className="row">
        <div className="mood-dot" />
        <div className="mood-text">{mood}</div>
      </div>
    </div>
  );
});
