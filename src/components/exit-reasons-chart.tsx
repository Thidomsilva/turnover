
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, LabelList } from 'recharts';

interface ExitReasonsChartProps {
    data: { 
        name: string; 
        value: number;
    }[];
}

export function ExitReasonsChart({ data }: ExitReasonsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
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
            width={120} // Adjust width to accommodate longer reason texts
            tick={{
                textAnchor: 'start',
                dx: -115, // Move ticks to the left
            }}
             />
        <Tooltip 
            cursor={{ fill: 'hsl(var(--secondary))' }}
            contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
            }}
        />
        <Bar dataKey="value" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]}>
             <LabelList dataKey="value" position="right" fill="hsl(var(--foreground))" fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
