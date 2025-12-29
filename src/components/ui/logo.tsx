
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
    {/* 'R' curve */}
    <path d="M29.5 10C35.8513 10 41 15.1487 41 21.5C41 27.8513 35.8513 33 29.5 33" />
    
    {/* Vertical Stem */}
    <path d="M10 10V40" />

    {/* Horizontal bars */}
    <path d="M10 15.5H29.5" />
    <path d="M10 24H29.5" />
    <path d="M10 32.5H22" />

    {/* Bottom 'E'-like bars */}
    <path d="M10 40H20" />
    <path d="M10 36H16" />
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
