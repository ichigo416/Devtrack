import { useEffect, useState } from "react";
import { getRepos, getAnalytics } from "./services/api";
import Heatmap from "./components/Heatmap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import "./App.css";

function App() {
  const [repos, setRepos] = useState<any[]>([]);
  const [commitMap, setCommitMap] = useState<any>({});
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRepos("ichigo416")
      .then((res: any) => setRepos(res.data || []))
      .catch(() => setRepos([]));

    getAnalytics("ichigo416")
      .then((res: any) => {
        const raw = res.data || {};

        // ✅ SAFE HANDLING
        const map = raw.commitMap || {};
        setCommitMap(map);
        setStats(raw.stats || null);
        setInsights(raw.insights || []);

        const formatted = Object.entries(map).map(
          ([date, count]: any) => ({
            date,
            commits: count,
          })
        );

        setChartData(formatted);
      })
      .catch(() => {
        setCommitMap({});
        setStats(null);
        setInsights([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <h1>DevTrack 🚀</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* REPOS */}
          <h2>Repositories</h2>
          <div className="grid">
            {repos.map((repo: any) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                className="card"
              >
                <h3>{repo.name}</h3>
                <p>{repo.language || "Unknown"}</p>
                <span>⭐ {repo.stargazers_count}</span>
              </a>
            ))}
          </div>

          {/* 📊 SCORE */}
          {stats && (
            <>
              <h2 style={{ marginTop: "30px" }}>
                Productivity Score: {stats.score}
              </h2>
              <p>Total Commits: {stats.totalCommits}</p>
              <p>Active Days: {stats.days}</p>
              <p>Avg per Day: {stats.avgPerDay}</p>
            </>
          )}

          {/* 📊 CHART */}
          <h2 style={{ marginTop: "30px" }}>Commit Trends</h2>
          {chartData.length > 0 ? (
            <LineChart width={800} height={300} data={chartData}>
              <CartesianGrid />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="commits" />
            </LineChart>
          ) : (
            <p>No chart data</p>
          )}

          {/* 🔥 HEATMAP */}
          <h2 style={{ marginTop: "30px" }}>Activity Heatmap</h2>
          <Heatmap data={commitMap} />

          {/* 🧠 INSIGHTS */}
          <h2 style={{ marginTop: "30px" }}>Insights</h2>
          {insights.length > 0 ? (
            insights.map((insight, i) => (
              <p key={i}>👉 {insight}</p>
            ))
          ) : (
            <p>No insights available</p>
          )}
        </>
      )}
    </div>
  );
}

export default App;