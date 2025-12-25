'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { LoaderCircle, FolderKanban, Users, FileText, CircleDollarSign, Bell, LogOut, MessageSquareQuote } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';
import { logout } from '@/firebase/auth';

const adminNavItems = [
  { href: '/admin/projects', label: 'Projects', icon: <FolderKanban /> },
  { href: '/admin/users', label: 'Users', icon: <Users /> },
  { href: '/admin/testimonials', label: 'Testimonials', icon: <MessageSquareQuote /> },
  { href: '/admin/deliverables', label: 'Deliverables', icon: <FileText /> },
  { href: '/admin/payments', label: 'Payments', icon: <CircleDollarSign /> },
  { href: '/admin/notifications', label: 'Notifications', icon: <Bell /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Wait until user state is determined

    // If on any admin page (except login) and not logged in, redirect to login
    if (!user && pathname !== '/admin/login') {
      router.push('/admin/login');
      return;
    }
    
    // If logged in, but not an admin, deny access and push to client login
    if (user && userProfile && userProfile.role !== 'admin') {
      console.warn('Access Denied: User is not an admin.');
      router.push('/login'); 
      return;
    }

    // If logged in as admin but on login page, redirect to admin dashboard
    if (user && userProfile?.role === 'admin' && pathname === '/admin/login') {
      router.push('/admin');
    }

  }, [user, userProfile, loading, router, pathname]);

  // Show a loading screen while we verify auth state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // For the login page, don't render the admin layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  
  // If we are still waiting for a valid user/profile, show loading.
  // This prevents a flash of the dashboard for non-admin users before redirection.
  if (!user || !userProfile) {
     return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={{ children: item.label }}>
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarHeader>
           <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip={{children: 'Logout'}}>
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
           </SidebarMenu>
        </SidebarHeader>
      </Sidebar>
      <SidebarInset>
         <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:h-16 lg:px-6">
            <div className="flex items-center gap-2 md:hidden">
              <SidebarTrigger />
              <Logo />
            </div>
            <div className="flex-1">
                <h1 className="text-lg font-semibold">{adminNavItems.find(item => pathname.startsWith(item.href))?.label || 'Admin Dashboard'}</h1>
            </div>
         </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
