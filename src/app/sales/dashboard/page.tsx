
'use client';

import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle } from 'lucide-react';

export default function SalesDashboardPage() {
  const { user, loading: userLoading } = useUser();

  if (userLoading || !user) {
    return (
       <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Welcome, {user.name}!
        </h1>
        <p className="text-lg text-muted-foreground">
          This is your Sales Dashboard Overview.
        </p>
      </div>
      
       <Card>
            <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Key metrics and assigned leads will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>This section is under construction.</p>
            </CardContent>
       </Card>
    </div>
  );
}
