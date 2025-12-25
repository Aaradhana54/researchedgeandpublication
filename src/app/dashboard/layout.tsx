'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
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
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  CircleDollarSign,
  LogOut,
  LoaderCircle
} from 'lucide-react';
import { useUser } from '@/firebase';
import { logout } from '@/firebase/auth';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard /> },
  { href: '/dashboard/projects', label: 'My Projects', icon: <FolderKanban /> },
  { href: '/dashboard/files', label: 'Files & Deliverables', icon: <FileText /> },
  { href: '/dashboard/payments', label: 'Payments & Invoices', icon: <CircleDollarSign /> },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If loading is finished and there's still no user, redirect to login.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // While authentication is in progress, show a global loading screen.
  // This prevents any flashes of content or incorrect redirects.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If loading is complete but there is still no user, it means the redirect is about to happen.
  // Rendering null avoids a brief flash of the dashboard layout.
  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                  tooltip={{
                    children: item.label,
                  }}
                >
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
                <SidebarMenuButton onClick={handleLogout} tooltip={{ children: 'Logout' }}>
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
                {/* Header content can go here */}
            </div>
         </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
