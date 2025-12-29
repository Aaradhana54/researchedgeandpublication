
'use client';

import {
  FolderKanban,
  LayoutGrid,
  LogOut,
  Users,
  Wallet,
  DollarSign,
  ChevronDown,
  Bell,
  CreditCard,
  ClipboardCheck,
  Briefcase,
  PenTool,
  TrendingUp,
  BookCheck,
  Banknote,
  Paintbrush,
  MessageSquare,
  UserCheck as UserCheckIcon,
  CheckCircle,
} from 'lucide-react';
import React from 'react';
import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { logout } from '@/firebase/auth';
import type { Notification } from '@/lib/types';
import { collection, query, where } from 'firebase/firestore';
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
  SidebarMenuBadge,
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: <LayoutGrid /> },
  { href: '/admin/users', label: 'User Management', icon: <Users /> },
  { 
    label: 'Team Management', 
    icon: <Briefcase />,
    subItems: [
        { href: '/admin/team/writing', label: 'Writing Team', icon: <PenTool /> },
        { href: '/admin/team/sales', label: 'Sales Team', icon: <TrendingUp /> },
        { href: '/admin/team/publication', label: 'Publication Team', icon: <BookCheck /> },
        { href: '/admin/team/accounts', label: 'Accounts Team', icon: <Banknote /> },
    ]
  },
  { 
    label: 'Leads', 
    icon: <Briefcase />,
    subItems: [
        { href: '/admin/leads', label: 'All Leads', icon: <Users /> },
        { href: '/admin/projects', label: 'Client Leads', icon: <FolderKanban /> },
        { href: '/admin/partner-leads', label: 'Partner Leads', icon: <UserCheckIcon /> },
        { href: '/admin/website-leads', label: 'Website Leads', icon: <MessageSquare /> },
    ]
  },
  { href: '/admin/approved-leads', label: 'Approved Leads', icon: <CheckCircle /> },
  { href: '/admin/accounts', label: 'Accounts', icon: <Wallet /> },
  { href: '/admin/sales', label: 'Sales', icon: <DollarSign /> },
  { href: '/admin/payouts', label: 'Payouts', icon: <ClipboardCheck /> },
  { href: '/admin/invoices', label: 'Invoices', icon: <CreditCard /> },
  { href: '/admin/notifications', label: 'Notifications', icon: <Bell /> },
  { href: '/admin/marketing', label: 'Marketing Kit', icon: <Paintbrush /> },
];

function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const notificationsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'notifications'),
      where('userId', '==', user.uid),
      where('isRead', '==', false)
    );
  }, [user, firestore]);

  const { data: unreadNotifications } = useCollection<Notification>(notificationsQuery);
  const unreadCount = unreadNotifications?.length ?? 0;

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const getInitials = (name = '') => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const isLeadsActive = ['/admin/leads', '/admin/projects', '/admin/partner-leads', '/admin/website-leads'].some(p => pathname.startsWith(p));


  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {adminNavItems.map((item) => (
            item.subItems ? (
                 <Collapsible key={item.label} defaultOpen={item.subItems.some(sub => pathname.startsWith(sub.href)) || (item.label === 'Leads' && isLeadsActive)}>
                    <CollapsibleTrigger asChild>
                         <SidebarMenuButton className="w-full justify-between" isActive={item.label === 'Leads' && isLeadsActive}>
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
                       <div className="flex items-center gap-2">
                         {item.icon}
                         <span>{item.label}</span>
                       </div>
                       {item.href === '/admin/notifications' && unreadCount > 0 && (
                          <SidebarMenuBadge>{unreadCount}</SidebarMenuBadge>
                       )}
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


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isSalesViewingProject = user?.role === 'sales-team' && pathname.startsWith('/admin/projects/');
  const isWriterViewingProject = user?.role === 'writing-team' && pathname.startsWith('/admin/projects/');

  useEffect(() => {
    // If we are not loading and the current page is not the login page
    if (!loading && pathname !== '/admin/login') {
      // If there is no user or the user is not an admin, redirect to login
      // Exception: allow sales team & writers to view project detail pages.
      const isAllowedSpecialRole = isSalesViewingProject || isWriterViewingProject;
      if (!user || (user.role !== 'admin' && !isAllowedSpecialRole)) {
        router.replace('/admin/login');
      }
    }
    // If the user is logged in as an admin and tries to visit the login page, redirect to dashboard
    if (!loading && user && user.role === 'admin' && pathname === '/admin/login') {
        router.replace('/admin/dashboard');
    }

  }, [user, loading, router, pathname, isSalesViewingProject, isWriterViewingProject]);

  // Don't protect the login page itself with a loader/permission check
  if (pathname === '/admin/login') {
      return <>{children}</>;
  }

  // If a sales team member or writer is viewing a project, we can show the content directly
  // but without the full admin sidebar. We'll show a simplified layout.
  if (isSalesViewingProject || isWriterViewingProject) {
      const backPath = isSalesViewingProject ? '/sales/projects' : '/writing/tasks';
      const backText = isSalesViewingProject ? 'Back to Sales Portal' : 'Back to Writing Portal';
      return (
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <Logo />
               <div className="flex flex-1 items-center justify-end space-x-4">
                  <Button variant="ghost" onClick={() => router.push(backPath)}>{backText}</Button>
               </div>
            </div>
          </header>
           <main className="flex-1">{children}</main>
        </div>
      )
  }


  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (user.role !== 'admin') {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }


  return (
     <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
