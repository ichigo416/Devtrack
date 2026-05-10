import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#7c3aed","#3178c6","#3572A5","#f34b7d","#00B4AB","#f1e05a","#dea584","#b07219","#00ADD8","#888"];

export default function LanguageChart({ langMap, dark }: { langMap: Record<string, number>; dark: boolean }) {
  const data = Object.entries(langMap).map(([name, value]) => ({ name, value }));
  if (data.length === 0) return <p className="empty">No language data</p>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
          paddingAngle={3} dataKey="value">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip
          contentStyle={{ background: dark ? "#1f2028" : "#fff", border: "1px solid #444", borderRadius: 8 }}
          formatter={(val: any, name: any) => [`${val} repo${val !== 1 ? "s" : ""}`, name]}
        />
        <Legend formatter={(val) => <span style={{ color: dark ? "#c9d1d9" : "#374151", fontSize: 13 }}>{val}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
} 