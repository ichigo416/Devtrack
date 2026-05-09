import { useRef } from "react";
import html2canvas from "html2canvas";

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
  "C++": "#f34b7d", Dart: "#00B4AB", Java: "#b07219", Go: "#00ADD8", Rust: "#dea584",
};

export default function ShareCard({ user, stats, achievements, bestDay, bestHour, langMap, onClose, dark }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const topLang = Object.entries(langMap).sort(([, a]: any, [, b]: any) => b - a)[0]?.[0] || "Code";

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: null });
    const link = document.createElement("a");
    link.download = `devtrack-${user.username}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: 16 }}>📤 Your Developer Card</h2>

        {/* The actual card that gets screenshot */}
        <div ref={cardRef} className="share-card-inner">
          <div className="share-gradient" />
          <div className="share-top">
            <img src={user.avatarUrl} alt={user.username} className="share-avatar" />
            <div>
              <div className="share-name">{user.displayName || user.username}</div>
              <div className="share-handle">@{user.username} · DevTrack 🚀</div>
            </div>
          </div>

          <div className="share-stats">
            <div className="share-stat">
              <span className="share-stat-val">{stats.totalCommits}</span>
              <span className="share-stat-label">Commits</span>
            </div>
            <div className="share-stat">
              <span className="share-stat-val">{stats.streak}🔥</span>
              <span className="share-stat-label">Streak</span>
            </div>
            <div className="share-stat">
              <span className="share-stat-val">{stats.score}</span>
              <span className="share-stat-label">Score</span>
            </div>
            <div className="share-stat">
              <span className="share-stat-val">{stats.days}</span>
              <span className="share-stat-label">Active Days</span>
            </div>
          </div>

          <div className="share-meta">
            {bestDay && <span>📅 Most active: {bestDay}</span>}
            {bestHour && <span>⏰ Peak time: {bestHour}</span>}
            <span>💻 Top lang: <span style={{ color: LANG_COLORS[topLang] || "#a78bfa" }}>{topLang}</span></span>
          </div>

          {achievements.length > 0 && (
            <div className="share-achievements">
              {achievements.slice(0, 4).map((a: any) => (
                <span key={a.id} className="share-badge">{a.emoji} {a.title}</span>
              ))}
            </div>
          )}

          <div className="share-footer">devtrack.app · {new Date().getFullYear()}</div>
        </div>

        <div className="modal-actions">
          <button className="download-btn" onClick={handleDownload}>⬇️ Download PNG</button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
} 