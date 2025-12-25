'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useUser } from "@/firebase";

export default function AdminDashboardPage() {
  const { userProfile } = useUser();

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
          Welcome, {userProfile?.name || 'Admin'}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Here's an overview of what's happening at Revio Research.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects Overview</CardTitle>
          <CardDescription>A summary of all client projects.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="h-40 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                <p>Project summary component will be here.</p>
            </div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage client and staff accounts.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="h-40 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                <p>User table component will be here.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
