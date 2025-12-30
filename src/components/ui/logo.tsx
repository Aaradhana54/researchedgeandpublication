
import Link from 'next/link';
import { cn } from '@/lib/utils';

const CustomLogoIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M25 90V10H65C79.9183 10 90 20.0817 90 35C90 49.9183 79.9183 60 65 60H45" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M45 60L75 90" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
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
