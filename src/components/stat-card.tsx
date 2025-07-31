import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserMinus, UserX, Clock, type LucideIcon, type LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

const iconMap: Record<string, ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>> = {
    Users,
    UserMinus,
    UserX,
    Clock
}

interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: string;
}

export function StatCard({ title, value, description, icon }: StatCardProps) {
    const Icon = iconMap[icon] || Users;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
