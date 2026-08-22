import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../lib/format';
import { chartPalette } from './chartColors';
import { PieChart as PieIcon } from 'lucide-react';

export default function CategoryPieChart({ breakdown }) {
  const colors = chartPalette(breakdown.length);

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 font-sans">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <div className="h-8 w-8 rounded-full bg-[#F5B800]/15 text-[#1E232A] flex items-center justify-center">
          <PieIcon className="h-4 w-4 text-[#F5B800]" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-lg text-[#1E232A]">
            Expense Distribution
          </h3>
          <p className="text-xs text-gray-500">Breakdown by category</p>
        </div>
      </div>

      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={breakdown}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={3}
            >
              {breakdown.map((entry, i) => (
                <Cell key={entry.category} fill={colors[i]} stroke="#ffffff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, border: '1px solid #E5E7EB', borderRadius: 16, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
            <Legend
              wrapperStyle={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}
              iconSize={10}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
