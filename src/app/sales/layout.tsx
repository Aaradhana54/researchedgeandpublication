
'use client';

import {
  LayoutGrid,
  LogOut,
  ChevronDown,
  Users,
  FolderKanban,
  CheckCircle,
  Briefcase,
  UserCheck as UserCheckIcon,
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
  SidebarTrigger,
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


const salesNavItems = [
  { href: '/sales/dashboard', label: 'Dashboard', icon: <LayoutGrid /> },
  { href: '/sales/assigned-leads', label: 'Assigned Leads', icon: <UserCheckIcon /> },
  { href: '/sales/approved-leads', label: 'Approved Leads', icon: <CheckCircle /> },
];

function SalesSidebar() {
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
          {salesNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href!}>
                <SidebarMenuButton isActive={pathname.startsWith(item.href!)}>
                  <div className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.label}</span>
                  </div>
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

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user || !['sales-team', 'sales-manager'].includes(user.role)) {
        router.replace('/sales/login');
      }
    }
     // If the user is logged in as sales and tries to visit the login page, redirect to dashboard
    if (!loading && user && ['sales-team', 'sales-manager'].includes(user.role) && pathname === '/sales/login') {
        router.replace('/sales/dashboard');
    }
  }, [user, loading, router, pathname]);

   if (pathname === '/sales/login') {
      return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!['sales-team', 'sales-manager'].includes(user.role)) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <SalesSidebar />
      <SidebarInset>
         <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger />
             <div className="flex-1">
                {/* Header content can go here if needed */}
            </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
