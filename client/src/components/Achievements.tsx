export default function Achievements({ achievements }: { achievements: any[] }) {
  return (
    <section>
      <h2>🏆 Achievements</h2>
      {achievements.length === 0 ? (
        <p className="empty">Keep coding to unlock achievements!</p>
      ) : (
        <div className="achievements-grid">
          {achievements.map((a) => (
            <div key={a.id} className="achievement-card">
              <span className="achievement-emoji">{a.emoji}</span>
              <div>
                <div className="achievement-title">{a.title}</div>
                <div className="achievement-desc">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
} 