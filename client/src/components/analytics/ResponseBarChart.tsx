import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { AnalyticsOption } from '../../types';

interface ResponseBarChartProps {
  options: AnalyticsOption[];
  totalAnswers: number;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: AnalyticsOption }[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-cream border border-border px-4 py-3 shadow-lg">
        <p className="text-xs font-semibold text-charcoal mb-1">{data.text}</p>
        <p className="text-xs text-muted">{data.count} votes · {data.percentage}%</p>
      </div>
    );
  }
  return null;
};

export const ResponseBarChart: React.FC<ResponseBarChartProps> = ({ options }) => {
  const data = options.map((o) => ({
    ...o,
    name: o.text.length > 20 ? o.text.slice(0, 20) + '…' : o.text,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2DDD6" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6B6B6B', fontFamily: 'DM Sans, sans-serif' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F1EB' }} />
        <Bar dataKey="count" radius={[0, 0, 0, 0]} maxBarSize={60}>
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={index === 0 ? '#C41E3A' : index === 1 ? '#1A1A1A' : `hsl(${index * 47}, 30%, 45%)`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
