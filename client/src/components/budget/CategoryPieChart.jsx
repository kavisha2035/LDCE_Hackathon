import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../lib/format';
import { chartPalette } from './chartColors';

export default function CategoryPieChart({ breakdown }) {
  const colors = chartPalette(breakdown.length);

  return (
    <div className="bg-white border border-ink p-5 shadow-[3px_3px_0px_0px_#1F2B2E]">
      <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-ink/60 mb-3">
        Breakdown by category
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={breakdown}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
            >
              {breakdown.map((entry, i) => (
                <Cell key={entry.category} fill={colors[i]} stroke="#1F2B2E" strokeWidth={1} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, border: '1px solid #1F2B2E', borderRadius: 2 }}
            />
            <Legend
              wrapperStyle={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, textTransform: 'uppercase' }}
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
