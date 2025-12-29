
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
  MessageSquare,
  CheckCircle2,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


const salesNavItems = [
  { href: '/sales/dashboard', label: 'Overview', icon: <LayoutGrid /> },
  { href: '/sales/clients', label: 'Clients', icon: <Users /> },
   { 
    label: 'Leads', 
    icon: <Briefcase />,
    subItems: [
        { href: '/sales/leads', label: 'Your Assigned Leads', icon: <Users /> },
        { href: '/sales/projects', label: 'Client Leads', icon: <FolderKanban /> },
        { href: '/sales/partner-leads', label: 'Partner Leads', icon: <UserCheckIcon /> },
        { href: '/sales/website-leads', label: 'Website Leads', icon: <MessageSquare /> },
    ]
  },
  { href: '/sales/approved-leads', label: 'Approved Leads', icon: <CheckCircle /> },
  { href: '/sales/completed-leads', label: 'Completed Leads', icon: <CheckCircle2 /> },
  { href: '/', label: 'Back to Site', icon: <Globe /> },
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

  const isLeadsActive = ['/sales/leads', '/sales/projects', '/sales/partner-leads', '/sales/website-leads'].some(p => pathname.startsWith(p));


  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {salesNavItems.map((item) => (
             item.subItems ? (
                 <Collapsible key={item.label} defaultOpen={isLeadsActive}>
                    <CollapsibleTrigger asChild>
                         <SidebarMenuButton className="w-full justify-between" isActive={isLeadsActive}>
                           <div className="flex items-center gap-2">
                               {item.icon}
                               <span>{item.label}</span>
                           </div>
                           <ChevronDown className="h-4 w-4" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map(subItem => (
                            <SidebarMenuItem key={subItem.label}>
                                <Link href={subItem.href}>
                                    <SidebarMenuSubButton asChild isActive={pathname.startsWith(subItem.href)}>
                                        <span className="flex items-center gap-2">
                                            {subItem.icon}
                                            <span>{subItem.label}</span>
                                        </span>
                                    </SidebarMenuSubButton>
                                </Link>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </Collapsible>
            ) : (
                <SidebarMenuItem key={item.label}>
                  <Link href={item.href!}>
                    <SidebarMenuButton isActive={pathname.startsWith(item.href!)}>
                      {item.icon}
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
            )
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
      if (!user || user.role !== 'sales-team') {
        router.replace('/sales/login');
      }
    }
     // If the user is logged in as sales and tries to visit the login page, redirect to dashboard
    if (!loading && user && user.role === 'sales-team' && pathname === '/sales/login') {
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

  if (user.role !== 'sales-team') {
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
            <SidebarTrigger className="sm:hidden" />
             <div className="flex-1">
                {/* Header content can go here if needed */}
            </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
