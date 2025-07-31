'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface OverviewChartProps {
    data: { name: string; total: number }[];
    onBarClick?: (name: string) => void;
}

export function OverviewChart({ data, onBarClick }: OverviewChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart 
        data={data}
        onClick={(e) => {
            if (e && e.activePayload && e.activePayload[0] && onBarClick) {
                onBarClick(e.activePayload[0].payload.name);
            }
        }}
      >
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
            cursor={{ fill: 'hsl(var(--secondary))', cursor: 'pointer' }}
            contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
            }}
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} style={{ cursor: 'pointer' }} />
      </BarChart>
    </ResponsiveContainer>
  );
}
