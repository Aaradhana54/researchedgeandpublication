'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, LoaderCircle, Home, FilePlus, FolderKanban } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { logout } from '@/firebase/auth';
import { useSidebar, SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


const dashboardNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <Home /> },
    { href: '/dashboard/projects/new', label: 'New Project', icon: <FilePlus /> },
    { href: '/dashboard/projects', label: 'My Projects', icon: <FolderKanban /> },
];

function DashboardHeader() {
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
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1" />
            {user && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </header>
    );
}


function DashboardSidebar() {
    const { setOpen } = useSidebar();
    
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarHeader className="border-b">
                   <Logo />
                </SidebarHeader>
                <SidebarMenu>
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
                    <DashboardHeader />
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

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Dashboard>{children}</Dashboard>;
  }

  return null;
}
