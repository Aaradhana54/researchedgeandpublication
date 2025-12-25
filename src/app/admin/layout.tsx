'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { LoaderCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/firebase/auth';

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
      // If there is no user or the user is not an admin, redirect to login
      if (!user || user.role !== 'admin') {
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
  
  if (user.role !== 'admin') {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-lg font-bold">Admin Panel</h1>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
