
import Link from 'next/link';
import { cn } from '@/lib/utils';

const CustomLogoIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Open Book Shape */}
    <path d="M10 38V12C10 9.23858 12.2386 7 15 7H35C37.7614 7 40 9.23858 40 12V38" />
    <path d="M10 38H40" />
    {/* Arrow indicating 'Edge' and 'Publication' */}
    <path d="M25 28L35 18" />
    <path d="M25 18H35V28" />
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
