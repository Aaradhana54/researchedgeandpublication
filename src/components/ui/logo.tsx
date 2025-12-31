
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
       <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-primary"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
          fill="currentColor"
        />
        <path
          d="M15.25 15.5H11.75V9.5H13.25V11.5H15.25C15.94 11.5 16.5 12.06 16.5 12.75V14.25C16.5 14.94 15.94 15.5 15.25 15.5ZM13.25 14H15.25V13H13.25V14Z"
          fill="currentColor"
        />
      </svg>
      <span className="font-headline tracking-wider">REDGE&P</span>
    </Link>
  );
}
