
import Link from 'next/link';
import { cn } from '@/lib/utils';

const CustomLogoIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* R Bowl */}
    <path d="M29.5 12C35.8513 12 41 17.1487 41 23.5C41 29.8513 35.8513 35 29.5 35" />
    
    {/* Vertical Stem */}
    <path d="M10 12V38" />

    {/* E horizontal bars */}
    <path d="M10 17.5H29.5" />
    <path d="M10 23.5H29.5" />
    <path d="M10 29.5H29.5" />

    {/* Bottom Prongs */}
    <path d="M10 38H41" />
    <path d="M15 38V42" />
    <path d="M20.25 38V42" />
    <path d="M25.5 38V42" />
    <path d="M30.75 38V42" />
    <path d="M36 38V42" />
  </svg>
);


export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/#home"
      className={cn(
        'group flex items-center gap-2 text-lg font-bold text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm p-1',
        className
      )}
    >
      <CustomLogoIcon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
      <span className="font-headline tracking-wider">REDGE&P</span>
    </Link>
  );
}
