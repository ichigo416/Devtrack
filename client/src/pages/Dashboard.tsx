import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, logout, getRepos, getAnalytics, saveGoal, getGoals } from "../services/api";
import Heatmap from "../components/Heatmap";
import ShareCard from "../components/ShareCard.tsx";
import LanguageChart from "../components/LanguageChart.tsx";
import Achievements from "../components/Achievements.tsx";
import DailyChallenge from "../components/DailyChallenge.tsx";
import SkeletonLoader from "../components/SkeletonLoader.tsx";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";
import "../App.css";

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
  "C++": "#f34b7d", Dart: "#00B4AB", Java: "#b07219", Go: "#00ADD8",
  Rust: "#dea584", Ruby: "#701516", Unknown: "#888",
};

function timeAgo(dateStr: string) {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

// Animated counter hook
function useCounter(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return val;
}

function StatCard({ val, label, badge, prefix = "" }: any) {
  const animated = useCounter(typeof val === "number" ? val : parseFloat(val) || 0);
  return (
    <div className="stat-card">
      <span className="stat-val">{prefix}{typeof val === "number" ? animated : val}</span>
      <span className="stat-label">{label}</span>
      {badge && <span className="stat-badge">{badge}</span>}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [commitMap, setCommitMap] = useState<any>({});
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [burnout, setBurnout] = useState<string[]>([]);
  const [percentile, setPercentile] = useState<number | null>(null);
  const [bestDay, setBestDay] = useState<string | null>(null);
  const [bestHour, setBestHour] = useState<string | null>(null);
  const [monthOverMonth, setMonthOverMonth] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [langMap, setLangMap] = useState<any>({});
  const [goals, setGoals] = useState<any[]>([]);
  const [goalType, setGoalType] = useState("weekly_commits");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [goalSaved, setGoalSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => { document.body.dataset.theme = dark ? "dark" : "light"; }, [dark]);

  useEffect(() => {
    getMe()
      .then((res: any) => {
        const u = res.data;
        setUser(u);
        return Promise.all([
          getRepos(u.username),
          getAnalytics(u.username),
          getGoals(u.username),
        ]);
      })
      .then(([reposRes, analyticsRes, goalsRes]: any) => {
        setRepos(reposRes.data || []);
        const raw = analyticsRes.data || {};
        setCommitMap(raw.commitMap || {});
        setStats(raw.stats || null);
        setInsights(raw.insights || []);
        setBurnout(raw.burnout || []);
        setPercentile(raw.percentile ?? null);
        setBestDay(raw.bestDay || null);
        setBestHour(raw.bestHour || null);
        setMonthOverMonth(raw.monthOverMonth || null);
        setAchievements(raw.achievements || []);
        setLangMap(raw.langMap || {});
        const formatted = Object.entries(raw.commitMap || {})
          .map(([date, count]: any) => ({ date, commits: count }))
          .sort((a, b) => a.date.localeCompare(b.date));
        setChartData(formatted);
        setGoals(goalsRes.data || []);
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSaveGoal = async () => {
    if (!goalTarget || !user) return;
    const newGoal = { type: goalType, target: Number(goalTarget), deadline: goalDeadline, createdAt: new Date().toISOString() };
    await saveGoal(user.username, newGoal);
    setGoals((prev) => [...prev, newGoal]);
    setGoalTarget(""); setGoalDeadline(""); setGoalSaved(true);
    setTimeout(() => setGoalSaved(false), 2000);
  };

  const getGoalProgress = (goal: any) => {
    const now = new Date();
    if (goal.type === "weekly_commits") {
      const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
      const count = Object.entries(commitMap)
        .filter(([d]: any) => new Date(d) >= weekAgo)
        .reduce((s: number, [, c]: any) => s + c, 0);
      return { current: count, pct: Math.min(100, Math.round((count / goal.target) * 100)) };
    }
    if (goal.type === "streak") {
      let streak = 0;
      const d = new Date();
      while (commitMap[d.toISOString().split("T")[0]]) { streak++; d.setDate(d.getDate() - 1); }
      return { current: streak, pct: Math.min(100, Math.round((streak / goal.target) * 100)) };
    }
    return { current: 0, pct: 0 };
  };

  const recentlyActive = (repo: any) =>
    repo.pushed_at && Date.now() - new Date(repo.pushed_at).getTime() < 7 * 86400000;

  if (loading) return <SkeletonLoader dark={dark} />;

  return (
    <div className={`app-root ${dark ? "dark" : "light"}`}>
      {/* Header */}
      <header className="header">
  <h1>DevTrack 🚀</h1>
  <div className="header-right">
    {user && (
      <div className="user-info">
        <img src={user.avatarUrl} alt={user.username} className="avatar" />
        <span className="username">@{user.username}</span>
      </div>
    )}
    <button className="theme-toggle" onClick={() => setDark(d => !d)}>
      {dark ? "☀️" : "🌙"}
    </button>
    <button className="squad-nav-btn" onClick={() => navigate("/squad")}>
      👥 Squads
    </button>
    <button className="share-btn" onClick={() => setShowShare(true)}>📤 Share</button>
    <button className="logout-btn" onClick={handleLogout}>Logout</button>
  </div>
</header>

      <main className="main">
        {/* Burnout */}
        {burnout.length > 0 && (
          <div className="burnout-banner">
            {burnout.map((msg, i) => <p key={i}>⚠️ {msg}</p>)}
          </div>
        )}

        {/* Daily Challenge */}
        <DailyChallenge commitMap={commitMap} />

        {/* Stats */}
        {stats && (
          <section>
            <h2>📊 Overview</h2>
            <div className="stats-row">
              <StatCard val={stats.score} label="Productivity Score"
                badge={percentile !== null ? `Top ${percentile}%` : undefined} />
              <StatCard val={stats.totalCommits} label="Total Commits" />
              <StatCard val={stats.days} label="Active Days" />
              <StatCard val={parseFloat(stats.avgPerDay)} label="Avg / Day" />
              <StatCard val={stats.streak} label="Streak" prefix="" />
            </div>

            {/* Month over month */}
            {monthOverMonth && (
              <div className="mom-banner">
                <span>📅 This month: <strong>{monthOverMonth.thisMonth}</strong> commits</span>
                <span className={`mom-diff ${monthOverMonth.diff >= 0 ? "up" : "down"}`}>
                  {monthOverMonth.diff >= 0 ? "▲" : "▼"} {Math.abs(monthOverMonth.diff)}% vs last month
                </span>
              </div>
            )}

            {/* Best day/hour */}
            {(bestDay || bestHour) && (
              <div className="best-row">
                {bestDay && <div className="best-card">📅 Most active day: <strong>{bestDay}</strong></div>}
                {bestHour && <div className="best-card">⏰ Peak coding time: <strong>{bestHour}</strong></div>}
              </div>
            )}
          </section>
        )}

        {/* Achievements */}
        <Achievements achievements={achievements} />

        {/* Language Chart */}
        <section>
          <h2>💻 Language Breakdown</h2>
          <LanguageChart langMap={langMap} dark={dark} />
        </section>

        {/* Repos */}
        <section>
          <h2>📁 Repositories</h2>
          <div className="grid">
            {repos.map((repo: any) => (
              <a key={repo.id} href={repo.html_url} target="_blank" rel="noreferrer" className="card">
                <div className="card-top">
                  <h3>{repo.name}</h3>
                  {recentlyActive(repo) && <span className="badge-active">Active</span>}
                </div>
                <div className="card-lang">
                  <span className="lang-dot" style={{ background: LANG_COLORS[repo.language] || "#888" }} />
                  <span>{repo.language || "Unknown"}</span>
                </div>
                <div className="card-meta">
                  <span>⭐ {repo.stargazers_count}</span>
                  <span className="card-date">{timeAgo(repo.pushed_at)}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Goals */}
        <section>
          <h2>🎯 Goals</h2>
          <div className="goals-form">
            <select value={goalType} onChange={(e) => setGoalType(e.target.value)}>
              <option value="weekly_commits">Weekly Commit Goal</option>
              <option value="streak">Streak Goal (days)</option>
            </select>
            <input type="number" placeholder="Target (e.g. 20)"
              value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} />
            <input type="date" value={goalDeadline} onChange={(e) => setGoalDeadline(e.target.value)} />
            <button onClick={handleSaveGoal}>{goalSaved ? "✅ Saved!" : "Set Goal"}</button>
          </div>
          {goals.length > 0 && (
            <div className="goals-list">
              {goals.map((g, i) => {
                const { current, pct } = getGoalProgress(g);
                const label = g.type === "weekly_commits" ? "commits this week" : "day streak";
                return (
                  <div key={i} className="goal-item">
                    <div className="goal-header">
                      <span>{g.type === "weekly_commits" ? "📅 Weekly Commits" : "🔥 Streak"}</span>
                      <span>{current} / {g.target} {label}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="goal-footer">
                      <span>{pct}% complete</span>
                      {g.deadline && <span>Due: {g.deadline}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Chart */}
        <section>
          <h2>📈 Commit Trends</h2>
          {chartData.length > 0 ? (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#333" : "#eee"} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: dark ? "#9ca3af" : "#6b7280" }} />
                  <YAxis tick={{ fontSize: 11, fill: dark ? "#9ca3af" : "#6b7280" }} />
                  <Tooltip contentStyle={{ background: dark ? "#1f2028" : "#fff", border: "1px solid #444", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="commits" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="empty">No chart data yet</p>}
        </section>

        {/* Heatmap */}
        <section>
          <h2>🔥 Activity Heatmap</h2>
          <div className="heatmap-wrap">
            <Heatmap data={commitMap} dark={dark} />
          </div>
        </section>

        {/* Insights */}
        <section>
          <h2>🧠 Insights</h2>
          <div className="insights-grid">
            {insights.length > 0
              ? insights.map((ins, i) => <div key={i} className="insight-card">👉 {ins}</div>)
              : <p className="empty">No insights yet</p>}
          </div>
        </section>
      </main>

      {/* Share Modal */}
      {showShare && user && stats && (
        <ShareCard
          user={user} stats={stats} achievements={achievements}
          bestDay={bestDay} bestHour={bestHour} langMap={langMap}
          onClose={() => setShowShare(false)} dark={dark}
        />
      )}
    </div>
  );
} 