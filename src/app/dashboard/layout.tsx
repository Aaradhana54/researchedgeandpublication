'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, LoaderCircle, LayoutDashboard, FolderKanban, FileText, Receipt } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { logout } from '@/firebase/auth';
import { useSidebar, SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';


const dashboardNavItems = [
    { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard /> },
    { href: '/dashboard/projects', label: 'My Projects', icon: <FolderKanban /> },
    { href: '/dashboard/files', label: 'Files & Deliverables', icon: <FileText /> },
    { href: '/dashboard/payments', label: 'Payment & Invoices', icon: <Receipt /> },
];

function DashboardSidebar() {
    const { setOpen } = useSidebar();
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
            <SidebarContent>
                <SidebarHeader className="border-b">
                   <Logo />
                </SidebarHeader>
                <SidebarMenu className="flex-1">
                    {dashboardNavItems.map((item) => (
                        <SidebarMenuItem key={item.label}>
                            <Link href={item.href}>
                                <SidebarMenuButton onClick={() => setOpen(false)}>
                                    {item.icon}
                                    <span>{item.label}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
                <SidebarFooter className="p-2 border-t">
                     {user && (
                        <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                           <Avatar className="h-9 w-9">
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                           </Avatar>
                           <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                           </div>
                        </div>
                     )}
                     <SidebarMenuItem>
                         <SidebarMenuButton onClick={handleLogout}>
                            <LogOut />
                            <span>Log out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarFooter>
            </SidebarContent>
        </Sidebar>
    );
}


function Dashboard({ children }: { children: React.ReactNode }) {
     return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <DashboardSidebar />
                <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 group-data-[collapsible=icon]:sm:pl-14 group-data-[collapsible=offcanvas]:sm:pl-0 transition-all duration-200">
                    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                       {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
     )
}


export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return <Dashboard>{children}</Dashboard>;
}
