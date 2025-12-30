
import Link from 'next/link';
import { cn } from '@/lib/utils';

const CustomLogoIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M50 85V20C50 14.4772 45.5228 10 40 10H15"
      stroke="currentColor"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M50 45C58.2843 45 65 38.2843 65 30C65 21.7157 58.2843 15 50 15"
      stroke="currentColor"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M50 85C50 85 85 85 85 70C85 55 50 55 50 55"
      stroke="currentColor"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 10V90H85V70"
      stroke="currentColor"
      strokeWidth="8"
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
