'use client';

import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useUser();

  if (!user) {
    // This should ideally not be seen because the layout handles redirection.
    return null;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Dashboard</CardTitle>
            <CardDescription>This is your personal space to manage your projects.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You are successfully logged in. This is a placeholder for your dashboard content.</p>
            <div className="mt-4">
              <Button asChild>
                <Link href="/#contact">Start a New Project</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
