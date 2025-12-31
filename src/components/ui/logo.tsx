
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { University } from 'lucide-react';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/#home"
      className={cn(
        'group flex items-center gap-2 text-lg font-bold text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm p-1',
        className
      )}
    >
      <University className="h-7 w-7 transition-transform duration-300 group-hover:rotate-[-12deg]" />
      <span className="font-headline tracking-wider">Revio Research</span>
    </Link>
  );
}
