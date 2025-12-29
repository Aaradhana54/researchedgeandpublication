
import Link from 'next/link';
import { cn } from '@/lib/utils';

const CustomLogoIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20.5 10H15V40H20.5"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 15.5H29.5C35.0228 15.5 39.5 19.9772 39.5 25.5C39.5 31.0228 35.0228 35.5 29.5 35.5H25.5"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
     <path
      d="M15 22.5H25.5"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 29.5H23"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
     <path
      d="M20.5 40V36.5H25.5"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
     <path
      d="M29.5 35.5L34.5 40.5"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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
