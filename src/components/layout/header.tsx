
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, LogOut, ChevronDown, User, Shield, Briefcase, Users, TrendingUp, PenTool } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/ui/logo';
import { useUser } from '@/firebase/auth/use-user';
import { logout } from '@/firebase/auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { ThemeToggleButton } from '../ui/theme-toggle-button';


const navItems = [
  { label: 'Home', href: 'home' },
  { label: 'About', href: 'about' },
  { label: 'Services', href: 'services' },
  { label: 'Process', href: 'process' },
  { label: 'Testimonials', href: 'testimonials' },
  { label: 'Contact', href: 'contact' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sectionIds = navItems.map((item) => item.href);
  const activeId = useScrollSpy(sectionIds, { rootMargin: '-20% 0px -80% 0px' });
  const { user, loading } = useUser();
  const router = useRouter();


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getInitials = (name = '') => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  }
  
  const getPortalPath = () => {
      if (!user) return '/';
      switch (user.role) {
          case 'admin':
          case 'sales-team':
          case 'sales-manager':
              return '/admin/dashboard';
          case 'client': return '/dashboard';
          case 'referral-partner': return '/referral-partner/dashboard';
          case 'writing-team': return '/writing/dashboard';
          default: return '/';
      }
  }

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
           <ThemeToggleButton />
          {!loading && user ? (
             <div className="flex items-center gap-2">
                <Button asChild>
                    <Link href={getPortalPath()}>Go to Portal</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className='h-10 w-10'>
                         <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      Portals
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Logins</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push('/admin/login')}>
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Login</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/login')}>
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span>Client Login</span>
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => router.push('/referral-partner/login')}>
                          <Users className="mr-2 h-4 w-4" />
                          <span>Referral Partner</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/admin/login')}>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          <span>Sales Manager Login</span>
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => router.push('/writing/login')}>
                          <PenTool className="mr-2 h-4 w-4" />
                          <span>Writer Login</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                     <DropdownMenuGroup>
                        <DropdownMenuLabel>Signups</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push('/signup')}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Client Signup</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          )}


          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader className="border-b pb-4">
                    <SheetTitle className="sr-only">Main Menu</SheetTitle>
                    <SheetDescription className="sr-only">Navigate the Research Edge and Publication website.</SheetDescription>
                    <Logo />
                </SheetHeader>
                <div className="flex flex-col h-full">
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
                      {!loading && user ? (
                        <>
                          <Button asChild onClick={() => setIsMobileMenuOpen(false)}>
                            <Link href={getPortalPath()}>Go to Portal</Link>
                          </Button>
                          <Button variant="outline" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Log Out
                          </Button>
                        </>
                      ) : (
                         <>
                           <Button asChild onClick={() => { router.push('/login'); setIsMobileMenuOpen(false); }}>
                              <Link href="/login">Client Login</Link>
                            </Button>
                             <Button variant="outline" asChild onClick={() => { router.push('/admin/login'); setIsMobileMenuOpen(false); }}>
                              <Link href="/admin/login">Admin Login</Link>
                            </Button>
                         </>
                      )}
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
