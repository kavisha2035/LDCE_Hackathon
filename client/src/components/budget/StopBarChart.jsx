import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../lib/format';

export default function StopBarChart({ perStop }) {
  return (
    <div className="bg-white border border-ink p-5 shadow-[3px_3px_0px_0px_#1F2B2E]">
      <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-ink/60 mb-3">
        Cost per stop
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={perStop} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2B2E" strokeOpacity={0.1} vertical={false} />
            <XAxis
              dataKey="city_name"
              tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fill: '#1F2B2E' }}
              axisLine={{ stroke: '#1F2B2E' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fill: '#1F2B2E' }}
              axisLine={{ stroke: '#1F2B2E' }}
              tickLine={false}
              tickFormatter={(v) => `₹${v / 1000}k`}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, border: '1px solid #1F2B2E', borderRadius: 2 }}
            />
            <Bar dataKey="amount" fill="#2C5F7C" stroke="#1F2B2E" strokeWidth={1} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
