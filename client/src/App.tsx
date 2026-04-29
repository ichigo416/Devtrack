import { useEffect, useState } from "react";
import { getRepos } from "./services/api";

function App() {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRepos("ichigo416")
      .then((res: any) => {
        console.log("DATA:", res.data);

        if (Array.isArray(res.data)) {
          setRepos(res.data);
        } else {
          setRepos([]);
        }

        setLoading(false);
      })
      .catch((err: any) => {
        console.error("ERROR:", err);
        setRepos([]);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>DevTrack 🚀</h1>

      {loading ? (
        <p>Loading...</p>
      ) : repos.length === 0 ? (
        <p>No repos found</p>
      ) : (
        repos.map((repo: any) => (
          <p key={repo.id}>{repo.name}</p>
        ))
      )}
    </div>
  );
}

export default App;