'use client';

import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus, LoaderCircle } from 'lucide-react';
import { SelectProjectTypeDialog } from '@/components/dashboard/select-project-type-dialog';
import { useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { firestore } from '@/firebase/client';
import { useMemo } from 'react';
import type { Project } from '@/lib/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useUser();

  const projectsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(firestore, 'projects'), where('userId', '==', user.uid));
  }, [user]);

  const { data: projects, loading } = useCollection<Project>(projectsQuery);

  if (!user || loading) {
    return (
       <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  const isNewUser = !projects || projects.length === 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          {isNewUser ? `Welcome, ${user.name}!` : `Welcome back, ${user.name}!`}
        </h1>
        <p className="text-lg text-muted-foreground">
          {isNewUser
            ? "You're ready to start your first project."
            : "You're ready to start your next project."}
        </p>
      </div>

      {isNewUser && (
        <Card className="w-full max-w-2xl shadow-soft">
          <CardHeader>
            <CardTitle>Start a New Project</CardTitle>
            <CardDescription>
              You have no active projects yet. Get started by adding a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SelectProjectTypeDialog>
              <Button size="lg" className="w-full">
                <FilePlus className="mr-2" />
                Add New Project
              </Button>
            </SelectProjectTypeDialog>
          </CardContent>
        </Card>
      )}

      {!isNewUser && projects && projects.length > 0 && (
         <div className="space-y-6">
             <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Recent Projects</h2>
                     <p className="text-muted-foreground">Here are your most recent projects.</p>
                </div>
                <div className="flex items-center gap-2">
                    <SelectProjectTypeDialog>
                        <Button variant="outline">
                            <FilePlus className="mr-2" />
                            New Project
                        </Button>
                    </SelectProjectTypeDialog>
                    <Button asChild>
                        <Link href="/dashboard/projects">View All Projects</Link>
                    </Button>
                </div>
             </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.slice(0, 3).map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle>{project.title}</CardTitle>
                            <CardDescription>{project.serviceType.replace(/-/g, ' ')}</CardDescription>
                        </CardHeader>
                         <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {project.topic || 'No topic specified'}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
