
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

interface RecentExitsProps {
    data: {
        name: string;
        tenure: number;
        type: string;
    }[];
}

export function RecentExits({ data }: RecentExitsProps) {
  return (
    <div className="space-y-8">
        {data.map((exit, index) => (
            <div key={index} className="flex items-center">
                <Avatar className="h-9 w-9">
                <AvatarImage src={`https://placehold.co/40x40.png?text=${exit.name.charAt(0)}`} alt="Avatar" />
                <AvatarFallback>{exit.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{exit.name}</p>
                <p className="text-sm text-muted-foreground">{`${exit.tenure} meses`}</p>
                </div>
                <div className="ml-auto font-medium">{exit.type}</div>
            </div>
        ))}
    </div>
  );
}
