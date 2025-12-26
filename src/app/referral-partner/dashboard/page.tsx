'use client';

import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle } from 'lucide-react';

export default function ReferralDashboardPage() {
  const { user } = useUser();

  if (!user) {
    return (
       <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Welcome, {user.name}!
        </h1>
        <p className="text-lg text-muted-foreground">
          This is your Referral Partner Dashboard.
        </p>
      </div>

      <Card className="w-full max-w-2xl shadow-soft">
        <CardHeader>
          <CardTitle>Partner Tools</CardTitle>
          <CardDescription>
            This section is under construction. Your referral links and performance metrics will be available here soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Thank you for being a valued partner!</p>
        </CardContent>
      </Card>
    </div>
  );
}
