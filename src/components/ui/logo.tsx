
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/#home"
      className={cn(
        'group flex items-center gap-2 text-lg font-bold text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm p-1',
        className
      )}
    >
      <div className="h-7 w-7 flex items-center justify-center bg-primary text-primary-foreground rounded-md font-headline transition-transform duration-300 group-hover:rotate-[-12deg]">
        R
      </div>
      <span className="font-headline tracking-wider">REDGE$P</span>
    </Link>
  );
}
