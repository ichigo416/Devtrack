const CHALLENGES = [
  { emoji: "⚡", text: "Make 3 commits before midnight", target: 3 },
  { emoji: "🔥", text: "Touch 2 different repos today", target: 2 },
  { emoji: "💪", text: "Push 5 commits today", target: 5 },
  { emoji: "🌅", text: "Make your first commit before noon", target: 1 },
  { emoji: "🚀", text: "Commit to a project you haven't touched in a week", target: 1 },
  { emoji: "🧠", text: "Make at least 1 commit with a meaningful message", target: 1 },
  { emoji: "📦", text: "Push 4 commits across any repos", target: 4 },
];

export default function DailyChallenge({ commitMap }: { commitMap: Record<string, number> }) {
  const dayIndex = new Date().getDay();
  const challenge = CHALLENGES[dayIndex % CHALLENGES.length];
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCommits = commitMap[todayStr] || 0;
  const pct = Math.min(100, Math.round((todayCommits / challenge.target) * 100));
  const done = todayCommits >= challenge.target;

  return (
    <div className={`daily-challenge ${done ? "done" : ""}`}>
      <div className="dc-header">
        <span className="dc-emoji">{challenge.emoji}</span>
        <div>
          <div className="dc-title">Daily Challenge {done ? "— Completed! 🎉" : ""}</div>
          <div className="dc-text">{challenge.text}</div>
        </div>
        <div className="dc-count">{todayCommits}/{challenge.target}</div>
      </div>
      <div className="progress-bar" style={{ marginTop: 10 }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: done ? "#16a34a" : undefined }} />
      </div>
    </div>
  );
} 