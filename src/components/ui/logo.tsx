
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
          className="h-5 w-5"
        >
          <path d="M8 3v18" />
          <path d="M8 3a4 4 0 0 1 4 4h4a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H8" />
        </svg>
      </div>
      <span className="font-headline tracking-wider">REDGE$P</span>
    </Link>
  );
}
