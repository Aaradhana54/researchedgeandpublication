import Link from 'next/link';
import { BookOpenCheck } from 'lucide-react';
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
      <BookOpenCheck className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
      <span className="font-headline">Revio Research</span>
    </Link>
  );
}
