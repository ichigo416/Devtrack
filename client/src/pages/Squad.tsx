import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, getMySquads, createSquad, joinSquad, getSquadLeaderboard } from "../services/api";
import "../App.css";

export default function Squad() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [squads, setSquads] = useState<any[]>([]);
  const [selectedSquad, setSelectedSquad] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [squadInfo, setSquadInfo] = useState<any>(null);
  const [newSquadName, setNewSquadName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [lbLoading, setLbLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [dark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    getMe()
      .then((res: any) => setUser(res.data))
      .catch(() => navigate("/login"));

    getMySquads()
      .then((res: any) => setSquads(res.data || []))
      .catch(() => setSquads([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newSquadName.trim()) return;
    setCreating(true); setError("");
    try {
      const res: any = await createSquad(newSquadName.trim());
      setSquads(prev => [...prev, res.data]);
      setNewSquadName("");
      handleSelectSquad(res.data);
    } catch {
      setError("Failed to create squad");
    } finally { setCreating(false); }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true); setError("");
    try {
      const res: any = await joinSquad(joinCode.trim());
      const already = squads.find(s => s._id === res.data._id);
      if (!already) setSquads(prev => [...prev, res.data]);
      setJoinCode("");
      handleSelectSquad(res.data);
    } catch {
      setError("Invalid invite code or squad not found");
    } finally { setJoining(false); }
  };

  const handleSelectSquad = async (squad: any) => {
    setSelectedSquad(squad);
    setLbLoading(true);
    try {
      const res: any = await getSquadLeaderboard(squad._id);
      setLeaderboard(res.data.leaderboard || []);
      setSquadInfo(res.data.squad);
    } catch {
      setLeaderboard([]);
    } finally { setLbLoading(false); }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMedal = (i: number) => ["🥇","🥈","🥉"][i] || `#${i + 1}`;

  return (
    <div className={`app-root ${dark ? "dark" : "light"}`}>
      <header className="header">
        <h1>DevTrack 🚀</h1>
        <div className="header-right">
          {user && (
            <div className="user-info">
              <img src={user.avatarUrl} alt={user.username} className="avatar" />
              <span className="username">@{user.username}</span>
            </div>
          )}
          <button className="theme-toggle" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="main">
        <div className="squad-layout">

          {/* Left panel */}
          <div className="squad-left">
            <section>
              <h2>👥 Create a Squad</h2>
              <div className="squad-form">
                <input
                  placeholder="Squad name (e.g. Team Alpha)"
                  value={newSquadName}
                  onChange={e => setNewSquadName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCreate()}
                />
                <button onClick={handleCreate} disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </section>

            <section>
              <h2>🔗 Join a Squad</h2>
              <div className="squad-form">
                <input
                  placeholder="Enter invite code (e.g. A1B2C3)"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && handleJoin()}
                  style={{ textTransform: "uppercase", letterSpacing: 2 }}
                />
                <button onClick={handleJoin} disabled={joining}>
                  {joining ? "Joining..." : "Join"}
                </button>
              </div>
              {error && <p className="squad-error">{error}</p>}
            </section>

            <section>
              <h2>📋 My Squads</h2>
              {loading ? (
                <p className="empty">Loading...</p>
              ) : squads.length === 0 ? (
                <p className="empty">No squads yet — create or join one!</p>
              ) : (
                <div className="squad-list">
                  {squads.map(s => (
                    <div
                      key={s._id}
                      className={`squad-item ${selectedSquad?._id === s._id ? "active" : ""}`}
                      onClick={() => handleSelectSquad(s)}
                    >
                      <div className="squad-item-name">{s.name}</div>
                      <div className="squad-item-meta">
                        {s.members.length} member{s.members.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right panel — Leaderboard */}
          <div className="squad-right">
            {!selectedSquad ? (
              <div className="squad-empty-state">
                <div style={{ fontSize: 64 }}>👥</div>
                <h3>Select or create a squad</h3>
                <p>Create a squad, share the invite code with friends, and track each other's progress!</p>
              </div>
            ) : (
              <>
                <div className="squad-header-row">
                  <div>
                    <h2>🏆 {squadInfo?.name || selectedSquad.name}</h2>
                    <p className="squad-members-count">
                      {leaderboard.length} member{leaderboard.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="invite-code-box">
                    <span className="invite-label">Invite Code</span>
                    <span className="invite-code">{squadInfo?.inviteCode || selectedSquad.inviteCode}</span>
                    <button
                      className="copy-btn"
                      onClick={() => copyCode(squadInfo?.inviteCode || selectedSquad.inviteCode)}
                    >
                      {copied ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                </div>

                {lbLoading ? (
                  <div className="squad-loading">
                    <div className="spinner" />
                    <p>Loading leaderboard...</p>
                  </div>
                ) : (
                  <div className="leaderboard">
                    {leaderboard.map((member, i) => (
                      <div key={member.username} className={`lb-row ${i === 0 ? "lb-first" : ""}`}>
                        <span className="lb-rank">{getMedal(i)}</span>
                        <img src={member.avatarUrl} alt={member.username} className="lb-avatar" />
                        <div className="lb-info">
                          <span className="lb-username">@{member.username}</span>
                          {member.username === user?.username && (
                            <span className="lb-you">you</span>
                          )}
                        </div>
                        <div className="lb-stats">
                          {member.hasData ? (
                            <>
                              <div className="lb-stat">
                                <span className="lb-stat-val">{member.score}</span>
                                <span className="lb-stat-label">Score</span>
                              </div>
                              <div className="lb-stat">
                                <span className="lb-stat-val">{member.totalCommits}</span>
                                <span className="lb-stat-label">Commits</span>
                              </div>
                              <div className="lb-stat">
                                <span className="lb-stat-val">{member.streak}🔥</span>
                                <span className="lb-stat-label">Streak</span>
                              </div>
                              <div className="lb-stat">
                                <span className="lb-stat-val">{member.days}</span>
                                <span className="lb-stat-label">Days</span>
                              </div>
                            </>
                          ) : (
                            <span className="lb-no-data">No data yet — needs to log in first</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}