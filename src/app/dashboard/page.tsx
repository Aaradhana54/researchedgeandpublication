'use client';

import { useUser } from '@/firebase';
import { ProjectList } from '@/components/dashboard/project-list';
import { LoaderCircle } from 'lucide-react';

export default function DashboardOverviewPage() {
  const { user, loading } = useUser();

  if (loading || !user) {
    // The layout handles the main loading state, but this is a fallback.
    return (
      <div className="flex items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-0">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
          Welcome, {user.displayName || 'Client'}!
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Here is an overview of your projects.
        </p>
      </div>
      <ProjectList userId={user.uid} />
    </div>
  );
}
