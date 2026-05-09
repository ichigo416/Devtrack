export default function SkeletonLoader({ dark }: { dark: boolean }) {
  return (
    <div className={`app-root ${dark ? "dark" : "light"}`}>
      <header className="header">
        <div className="skel" style={{ width: 140, height: 28, borderRadius: 6 }} />
        <div style={{ display: "flex", gap: 12 }}>
          <div className="skel" style={{ width: 80, height: 32, borderRadius: 8 }} />
          <div className="skel" style={{ width: 80, height: 32, borderRadius: 8 }} />
        </div>
      </header>
      <main className="main">
        <div className="stats-row">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="stat-card">
              <div className="skel" style={{ width: 60, height: 36, borderRadius: 6, marginBottom: 8 }} />
              <div className="skel" style={{ width: 90, height: 14, borderRadius: 4 }} />
            </div>
          ))}
        </div>
        <div>
          <div className="skel" style={{ width: 160, height: 22, borderRadius: 6, marginBottom: 16 }} />
          <div className="grid">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="skel" style={{ height: 100, borderRadius: 12 }} />
            ))}
          </div>
        </div>
        <div className="skel" style={{ width: "100%", height: 260, borderRadius: 14 }} />
        <div className="skel" style={{ width: "100%", height: 200, borderRadius: 14 }} />
      </main>
    </div>
  );
} 