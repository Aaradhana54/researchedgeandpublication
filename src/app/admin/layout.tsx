

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
  CheckCircle2,
  Globe,
  Star,
  UserCog,
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: <LayoutGrid /> },
  { href: '/admin/users', label: 'User Management', icon: <Users /> },
  { href: '/admin/team', label: 'Team Management', icon: <Briefcase /> },
  { 
    label: 'Leads', 
    icon: <FolderKanban />,
    subItems: [
        { href: '/admin/leads', label: 'All Leads', icon: <Users /> },
        { href: '/admin/projects', label: 'Client Leads', icon: <FolderKanban /> },
        { href: '/admin/partner-leads', label: 'Partner Leads', icon: <UserCheckIcon /> },
        { href: '/admin/website-leads', label: 'Website Leads', icon: <MessageSquare /> },
    ]
  },
  { href: '/admin/approved-leads', label: 'Approved Leads', icon: <CheckCircle /> },
  { href: '/admin/feedback', label: 'Feedback', icon: <Star /> },
  { href: '/admin/accounts', label: 'Accounts', icon: <Wallet /> },
  { href: '/admin/sales', label: 'Sales', icon: <DollarSign /> },
  { href: '/admin/payouts', label: 'Payouts', icon: <ClipboardCheck /> },
  { href: '/admin/invoices', label: 'Invoices', icon: <CreditCard /> },
  { href: '/admin/marketing', label: 'Marketing Kit', icon: <Paintbrush /> },
  { href: '/', label: 'Back to Site', icon: <Globe /> },
];


function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const router = useRouter();
  
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
                 <Collapsible key={item.label} defaultOpen={item.label === 'Leads' ? isLeadsActive : false}>
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
                       <div className="flex items-center gap-2">
                         {item.icon}
                         <span>{item.label}</span>
                       </div>
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

  useEffect(() => {
    // If we are not loading and the current page is not the login page
    if (!loading && pathname !== '/admin/login') {
      // If there is no user or the user is not an admin/sales, redirect to login
      if (!user || !['admin', 'sales-team', 'writing-team', 'sales-manager'].includes(user.role)) {
        router.replace('/admin/login');
      }
    }
    // If the user is logged in as an admin and tries to visit the login page, redirect to dashboard
    if (!loading && user && user.role === 'admin' && pathname === '/admin/login') {
        router.replace('/admin/dashboard');
    }

  }, [user, loading, router, pathname]);

  // Don't protect the login page itself with a loader/permission check
  if (pathname === '/admin/login') {
      return <>{children}</>;
  }


  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!['admin', 'sales-team', 'writing-team', 'sales-manager'].includes(user.role)) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }


  return (
     <SidebarProvider>
      <AdminSidebar />
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

    
