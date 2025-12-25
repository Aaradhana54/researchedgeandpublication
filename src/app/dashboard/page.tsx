'use client';

import { useUser } from '@/firebase';
import { CreateProjectDialog } from '@/components/dashboard/project-list';
import { LoaderCircle, PlusCircle } from 'lucide-react';

export default function DashboardOverviewPage() {
  const { user, loading } = useUser();

  if (loading || !user) {
    // The layout handles the main loading state, but this is a fallback.
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 gap-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
          Welcome, {user.displayName || 'Client'}!
        </h1>
        <p className="text-lg text-muted-foreground">
          This is your personal hub to manage projects, track progress, and collaborate with our team.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-card border-2 border-dashed rounded-lg">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Ready to start your next project?
            </h2>
            <p className="mt-2 text-muted-foreground max-w-md">
              Let's turn your idea into a high-quality publication. Click the button below to begin.
            </p>
            <div className="mt-6">
                <CreateProjectDialog userId={user.uid} />
            </div>
          </div>
      </div>
    </div>
  );
}
