
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      {pathname !== '/dashboard' ? (
        <Button asChild variant="ghost">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Link>
        </Button>
      ) : (
        <Link href="/dashboard" className="flex items-center gap-2">
          <Icons.logo className="h-6 w-6" />
          <span className="hidden font-bold md:inline-block">
            Gestão de Turnover
          </span>
        </Link>
      )}
    </nav>
  );
}
