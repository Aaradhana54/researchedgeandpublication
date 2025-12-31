
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
      <div className="h-8 w-8 flex items-center justify-center bg-primary text-primary-foreground rounded-md transition-transform duration-300 group-hover:rotate-[-12deg]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M12 3H8a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h4" />
          <path d="M8 12h8" />
          <path d="M16 12h0a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4h-4" />
        </svg>
      </div>
      <span className="font-headline tracking-wider">REDGE&amp;P</span>
    </Link>
  );
}
