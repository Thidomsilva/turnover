
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';

interface ExitsBySectorChartProps {
    data: { 
        name: string; 
        value: number;
    }[];
}

export function ExitsBySectorChart({ data }: ExitsBySectorChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart 
        data={data}
        layout="vertical"
        margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
        }}
      >
        <XAxis type="number" hide />
        <YAxis 
            dataKey="name" 
            type="category" 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            width={80}
        />
        <Tooltip 
            cursor={{ fill: 'hsl(var(--secondary))' }}
            contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
            }}
        />
        <Bar dataKey="value" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]}>
             <LabelList dataKey="value" position="right" fill="hsl(var(--foreground))" fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

    