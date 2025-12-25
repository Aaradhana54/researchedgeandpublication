'use client';

import { useRef, useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedWrapper({ children, className, delay = 0 }: AnimatedWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        'opacity-0 transform transition-all duration-700',
        isInView ? 'opacity-100 translate-y-0' : 'translate-y-6',
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
