

'use client';

import {
  LayoutGrid,
  LogOut,
  ChevronDown,
  FileText,
  ClipboardList,
  CheckCircle2,
  FolderKanban,
  Globe,
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
import { SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

const dashboardNavItems = [
  { href: '/writing/dashboard', label: 'Overview', icon: <LayoutGrid /> },
  { href: '/writing/tasks', label: 'My Tasks', icon: <ClipboardList /> },
  { href: '/writing/completed-leads', label: 'Completed Tasks', icon: <CheckCircle2 /> },
  { href: '/writing/submissions', label: 'Submissions', icon: <FileText /> },
  { href: '/', label: 'Back to Site', icon: <Globe /> },
];

function WritingSidebar() {
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
      <SheetHeader>
        <SheetTitle className="sr-only">Writer Dashboard Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Main navigation for the writer dashboard.
        </SheetDescription>
      </SheetHeader>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {dashboardNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton isActive={pathname.startsWith(item.href) && item.href !== '/'}>
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

export default function WritingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isLoginPage = pathname === '/writing/login';

    if (user) {
      if (user.role === 'writing-team') {
        if (isLoginPage) {
          router.replace('/writing/dashboard');
        }
      } else {
        router.replace('/writing/login');
      }
    } else {
      if (!isLoginPage) {
        router.replace('/writing/login');
      }
    }
  }, [user, loading, router, pathname]);

   if (pathname === '/writing/login') {
      return <>{children}</>;
  }

  if (loading || !user || user.role !== 'writing-team') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <WritingSidebar />
      <SidebarInset>
         <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="md:hidden" />
             <div className="flex-1">
                {/* Header content can go here if needed */}
            </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
