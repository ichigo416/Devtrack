const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const getColor = (count: number, dark: boolean) => {
  if (count === 0) return dark ? "#2d2d2d" : "#ebedf0";
  if (count <= 2) return "#9be9a8";
  if (count <= 4) return "#40c463";
  if (count <= 6) return "#30a14e";
  return "#216e39";
};

const Heatmap = ({ data, dark }: { data: Record<string, number>; dark: boolean }) => {
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  // Build list of all days in the past year
  const days: { date: string; count: number }[] = [];
  const cursor = new Date(oneYearAgo);
  while (cursor <= today) {
    const dateStr = cursor.toISOString().split("T")[0];
    days.push({ date: dateStr, count: data[dateStr] || 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  // Pad start so grid aligns to Sunday
  const firstDayOfWeek = new Date(days[0].date).getDay();
  const padded = Array(firstDayOfWeek).fill(null).concat(days);

  // Split into weeks
  const weeks: (typeof days[0] | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  // Month labels
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstReal = week.find(Boolean);
    if (firstReal) {
      const m = new Date(firstReal.date).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ label: MONTHS[m], col: wi });
        lastMonth = m;
      }
    }
  });

  const cellSize = 13;
  const gap = 3;
  const labelHeight = 20;
  const dayLabelWidth = 28;
  const totalW = dayLabelWidth + weeks.length * (cellSize + gap);
  const totalH = labelHeight + 7 * (cellSize + gap);

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={totalW} height={totalH} style={{ display: "block" }}>
        {/* Month labels */}
        {monthLabels.map(({ label, col }) => (
          <text
            key={label + col}
            x={dayLabelWidth + col * (cellSize + gap)}
            y={12}
            fontSize={11}
            fill={dark ? "#9ca3af" : "#6b7280"}
          >
            {label}
          </text>
        ))}

        {/* Day labels */}
        {[1, 3, 5].map((d) => (
          <text
            key={d}
            x={0}
            y={labelHeight + d * (cellSize + gap) + cellSize - 2}
            fontSize={10}
            fill={dark ? "#9ca3af" : "#6b7280"}
          >
            {DAYS[d]}
          </text>
        ))}

        {/* Cells */}
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            if (!day) return null;
            const x = dayLabelWidth + wi * (cellSize + gap);
            const y = labelHeight + di * (cellSize + gap);
            return (
              <rect
                key={day.date}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx={3}
                fill={getColor(day.count, dark)}
              >
                <title>{`${day.date}: ${day.count} commit${day.count !== 1 ? "s" : ""}`}</title>
              </rect>
            );
          })
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 12, color: dark ? "#9ca3af" : "#6b7280" }}>
        <span>Less</span>
        {[0, 2, 4, 6, 8].map((v) => (
          <div key={v} style={{ width: cellSize, height: cellSize, borderRadius: 3, background: getColor(v, dark) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default Heatmap;