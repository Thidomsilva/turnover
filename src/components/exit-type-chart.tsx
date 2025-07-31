'use client'

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"

interface ExitTypeChartProps {
    data: {
        type: string;
        value: number;
        fill: string;
    }[];
}

export function ExitTypeChart({ data }: ExitTypeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Tooltip
            cursor={{ fill: 'hsl(var(--secondary))' }}
            contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
            }}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="type"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={60}
          paddingAngle={5}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
