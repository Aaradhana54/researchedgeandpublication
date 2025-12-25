'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.replace('/admin/login');
      }
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-background border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-lg font-bold text-primary">Admin Panel</h1>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2" />
            Logout
          </Button>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}
