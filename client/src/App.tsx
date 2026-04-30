import { useEffect, useState } from "react";
import { getRepos, getAnalytics } from "./services/api";
import "./App.css";

function App() {
  const [repos, setRepos] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRepos("ichigo416")
      .then((res: any) => setRepos(res.data || []))
      .catch(() => setRepos([]));

    getAnalytics("ichigo416")
      .then((res: any) => setAnalytics(res.data || {}))
      .catch(() => setAnalytics({}))
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

          {/* ANALYTICS */}
          <h2 style={{ marginTop: "30px" }}>Commit Analytics</h2>
          <div className="analytics">
            {Object.entries(analytics).map(([date, count]) => (
              <div key={date} className="bar">
                <span>{date}</span>
                <div className="bar-fill" style={{ width: `${(count as number) * 20}px` }}>
                  {count as number}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;