
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
      <span className="font-headline tracking-wider">
        <span className="inline-block transition-transform duration-300 group-hover:scale-110 group-hover:text-accent">R</span>EDGE&P
      </span>
    </Link>
  );
}
