
'use client'

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"

interface ExitTypeChartProps {
    data: {
        type: string;
        value: number;
        fill: string;
    }[];
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


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
          innerRadius={50}
          paddingAngle={5}
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
