'use client';

import { useUser } from '@/firebase';
import { CreateProjectDialog } from '@/components/dashboard/project-list';
import { LoaderCircle, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="container mx-auto px-0 flex-1 flex flex-col items-center justify-center text-center">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
            Welcome, {user.displayName || 'Client'}!
            </h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-xl">
            This is your personal dashboard. Manage your projects, track progress, and communicate with our team all in one place.
            </p>
        </div>
        <div className="mt-8">
            <CreateProjectDialog userId={user.uid} />
        </div>
    </div>
  );
}
