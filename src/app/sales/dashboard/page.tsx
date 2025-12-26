'use client';

import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle } from 'lucide-react';

export default function SalesDashboardPage() {
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
          This is your Sales Dashboard.
        </p>
      </div>

      <Card className="w-full max-w-2xl shadow-soft">
        <CardHeader>
          <CardTitle>Sales Tools</CardTitle>
          <CardDescription>
            This section is under construction. Your leads, performance metrics, and tools will be available here soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Thank you for driving our growth!</p>
        </CardContent>
      </Card>
    </div>
  );
}
