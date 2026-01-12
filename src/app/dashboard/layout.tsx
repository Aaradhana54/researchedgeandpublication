

'use client';

import {
  FolderKanban,
  LayoutGrid,
  LogOut,
  FileText,
  CreditCard,
  ChevronDown,
  Globe,
  MessageSquare,
  CheckCircle,
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
  { href: '/dashboard', label: 'Overview', icon: <LayoutGrid /> },
  { href: '/dashboard/projects', label: 'My Projects', icon: <FolderKanban /> },
  { href: '/dashboard/approved-leads', label: 'Approved Leads', icon: <CheckCircle /> },
  { href: '/dashboard/chat', label: 'Chat', icon: <MessageSquare /> },
  { href: '/dashboard/files', label: 'Files & Deliverables', icon: <FileText /> },
  { href: '/dashboard/payments', label: 'Payment & Invoices', icon: <CreditCard /> },
  { href: '/', label: 'Back to Site', icon: <Globe /> },
];

function DashboardSidebar() {
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
        <SheetHeader>
          <SheetTitle className="sr-only">Client Dashboard Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Main navigation for the client dashboard.
          </SheetDescription>
        </SheetHeader>
        <SidebarMenu>
          {dashboardNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton isActive={pathname === item.href && item.href !== '/'}>
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

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/verify-email';

    if (user) {
      // User is logged in
      if (user.role !== 'client') {
        // Wrong role, kick them out
        logout().then(() => router.replace('/login'));
        return;
      }
      
      // User is a client, check for email verification
      if (!user.emailVerified) {
        // Redirect to a page that tells them to verify their email
        if (pathname !== '/verify-email') {
          router.replace('/verify-email');
        }
        return;
      }

      // User is a verified client, if they are on an auth page, send to dashboard
      if (isAuthPage) {
        router.replace('/dashboard');
      }

    } else {
      // User is not logged in, they should only be on auth pages
      if (!isAuthPage) {
        router.replace('/login');
      }
    }
  }, [user, loading, router, pathname]);

  if (pathname === '/login' || pathname === '/signup' || pathname === '/verify-email') {
    return <>{children}</>;
  }

  if (loading || !user || user.role !== 'client' || !user.emailVerified) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="flex flex-col">
         <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="md:hidden" />
             <div className="flex-1">
                {/* Header content can go here if needed */}
            </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
