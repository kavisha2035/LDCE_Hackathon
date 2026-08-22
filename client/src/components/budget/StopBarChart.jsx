import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../lib/format';
import { BarChart3 } from 'lucide-react';

export default function StopBarChart({ perStop }) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 font-sans">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <div className="h-8 w-8 rounded-full bg-[#F5B800]/15 text-[#1E232A] flex items-center justify-center">
          <BarChart3 className="h-4 w-4 text-[#F5B800]" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-lg text-[#1E232A]">
            Destination Stop Costs
          </h3>
          <p className="text-xs text-gray-500">Expenses allocated across cities</p>
        </div>
      </div>

      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={perStop} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="city_name"
              tick={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 'bold', fill: '#1E232A' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, border: '1px solid #E5E7EB', borderRadius: 16, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="amount" fill="#F5B800" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
