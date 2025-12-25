'use client';

import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FilePlus } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useUser();

  if (!user) {
    return null; // The layout handles the loading and auth check
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome back, {user.name}!</h1>
        <p className="text-lg text-muted-foreground">You're ready to start your next project.</p>
      </div>
      
      <Card className="w-full max-w-2xl shadow-soft">
        <CardHeader>
          <CardTitle>Start a New Project</CardTitle>
          <CardDescription>You have no active projects yet. Get started by adding a new one.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg" className="w-full">
              <Link href="/dashboard/projects/new">
                  <FilePlus className="mr-2" />
                  Add New Project
              </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
