'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/ui/logo';
import { useUser } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { label: 'Home', href: 'home' },
  { label: 'About', href: 'about' },
  { label: 'Services', href: 'services' },
  { label: 'Process', href: 'process' },
  { label: 'Testimonials', href: 'testimonials' },
  { label: 'Contact', href: 'contact' },
];

export function Header() {
  const { user, loading } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sectionIds = navItems.map((item) => item.href);
  const activeId = useScrollSpy(sectionIds, { rootMargin: '-20% 0px -80% 0px' });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm transition-all duration-300',
        scrolled ? 'shadow-md' : 'shadow-none'
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Logo />

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={`/#${item.href}`}
              className={cn(
                'relative px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-primary',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm'
              )}
            >
              {item.label}
              {activeId === item.href && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4/5 bg-primary transition-all duration-300" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!loading &&
            (user ? (
                <Button asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    Portal
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/login">Client Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Login</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ))}

          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between border-b pb-4">
                    <Logo />
                  </div>
                  <nav className="flex flex-col gap-4 mt-8">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={`/#${item.href}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'text-lg font-medium text-foreground/80 transition-colors hover:text-primary',
                          activeId === item.href && 'text-primary'
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                   <div className="mt-auto flex flex-col gap-2 border-t pt-4">
                     {!loading &&
                        (user ? (
                            <Button asChild>
                              <Link href="/dashboard">Dashboard</Link>
                            </Button>
                        ) : (
                          <>
                            <Button asChild variant="outline">
                              <Link href="/login">Client Login</Link>
                            </Button>
                            <Button asChild>
                              <Link href="/admin">Admin Login</Link>
                            </Button>
                          </>
                        ))}
                   </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
