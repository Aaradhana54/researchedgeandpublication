'use client';

import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FilePlus } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
        
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Your Dashboard</CardTitle>
            <CardDescription>Manage your projects and view their status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center border-2 border-dashed border-border rounded-lg p-12">
                <h3 className="text-lg font-medium text-muted-foreground mb-4">You have no active projects.</h3>
                <Button asChild>
                    <Link href="/dashboard/projects/new">
                        <FilePlus className="mr-2" />
                        Add New Project
                    </Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
