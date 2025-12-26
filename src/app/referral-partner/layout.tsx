'use client';

import {
  LayoutGrid,
  LogOut,
  ChevronDown,
  Users,
  Receipt,
  Paintbrush,
} from 'lucide-react';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/firebase/auth/use-user';
import { logout } from '@/firebase/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarFooter,
  SidebarGroup,
  SidebarSeparator,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoaderCircle } from 'lucide-react';
import { useEffect } from 'react';

const dashboardNavItems = [
  { href: '/referral-partner/dashboard', label: 'Overview', icon: <LayoutGrid /> },
  { href: '/referral-partner/dashboard#referred-clients', label: 'Referred Clients', icon: <Users /> },
  { href: '/referral-partner/dashboard#payout-history', label: 'Payouts', icon: <Receipt /> },
  { href: '/referral-partner/dashboard#marketing-kit', label: 'Marketing Kit', icon: <Paintbrush /> },
];

function PartnerSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getInitials = (name = '') => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {dashboardNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton isActive={pathname === item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarGroup>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start h-auto px-2 py-2">
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left shrink-0 truncate">
                      <span className="font-medium text-sm truncate">{user.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                    <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  Signed in as
                  <div className="text-sm font-medium leading-none truncate">{user.name}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function ReferralPartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'referral-partner') {
        router.replace('/referral-partner/login');
      }
    }
     // If the user is logged in as a partner and tries to visit the login page, redirect to dashboard
    if (!loading && user && user.role === 'referral-partner' && pathname === '/referral-partner/login') {
        router.replace('/referral-partner/dashboard');
    }
  }, [user, loading, router, pathname]);

   if (pathname === '/referral-partner/login') {
      return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (user.role !== 'referral-partner') {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <PartnerSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
