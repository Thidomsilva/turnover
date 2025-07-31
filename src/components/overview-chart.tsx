
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';

interface OverviewChartProps {
    data: { 
        name: string; 
        pedido: number;
        empresa: number;
    }[];
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
        margin={{
            top: 20,
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
        <Legend 
            verticalAlign="top" 
            wrapperStyle={{ top: -10, right: 0 }}
            formatter={(value) => value === 'pedido' ? 'Pedido' : 'Empresa'}
        />
        <Bar dataKey="pedido" stackId="a" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} style={{ cursor: 'pointer' }} >
             <LabelList dataKey="pedido" position="inside" fill="#fff" fontSize={12} formatter={(value: number) => value > 0 ? value : ''} />
        </Bar>
        <Bar dataKey="empresa" stackId="a" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} style={{ cursor: 'pointer' }} >
            <LabelList dataKey="empresa" position="inside" fill="#fff" fontSize={12} formatter={(value: number) => value > 0 ? value : ''} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
