'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { ProjectList } from '@/components/dashboard/project-list';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { LoaderCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-secondary py-12 md:py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
              Welcome, {user.displayName || 'Client'}
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Here is an overview of your projects.
            </p>
          </div>
          <ProjectList userId={user.uid} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
