import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      <Link href="/dashboard" className="flex items-center gap-2">
        <Icons.logo className="h-6 w-6" />
        <span className="hidden font-bold md:inline-block">
          Gestão de Turnover
        </span>
      </Link>
    </nav>
  );
}
