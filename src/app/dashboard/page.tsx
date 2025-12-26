
'use client';

import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus, LoaderCircle } from 'lucide-react';
import { SelectProjectTypeDialog } from '@/components/dashboard/select-project-type-dialog';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useMemo } from 'react';
import type { Project } from '@/lib/types';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const projectsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    // Order by 'asc' and then reverse on the client to avoid needing a composite index
    return query(
      collection(firestore, 'projects'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'asc'),
      limit(3)
    );
  }, [user, firestore]);
  
  const allProjectsQuery = useMemo(() => {
     if (!user || !firestore) return null;
     return query(collection(firestore, 'projects'), where('userId', '==', user.uid));
  }, [user, firestore]);

  const { data: recentProjects, loading: loadingRecent } = useCollection<Project>(projectsQuery);
  const { data: allProjects, loading: loadingAll } = useCollection<Project>(allProjectsQuery);
  
  const loading = loadingRecent || loadingAll;

  // Reverse the array to show the most recent projects first
  const displayedProjects = useMemo(() => recentProjects?.reverse() ?? [], [recentProjects]);

  if (!user || loading) {
    return (
       <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  const isNewUser = !allProjects || allProjects.length === 0;

  const getProjectStatusVariant = (status?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
      switch (status) {
          case 'approved':
              return 'default';
          case 'in-progress':
              return 'secondary';
          case 'completed':
              return 'default';
          case 'rejected':
              return 'destructive';
          case 'pending':
              return 'outline';
          default:
              return 'outline';
      }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          {isNewUser ? `Welcome, ${user.name}!` : `Welcome back, ${user.name}!`}
        </h1>
        <p className="text-lg text-muted-foreground">
          {isNewUser
            ? "You're ready to start your first project."
            : "Here's a quick overview of your account."}
        </p>
      </div>

      {isNewUser ? (
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
      ) : (
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
                {displayedProjects && displayedProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start gap-2">
                                <CardTitle className="flex-1">{project.title}</CardTitle>
                                <Badge variant={getProjectStatusVariant(project.status)} className="capitalize shrink-0">
                                    {project.status || 'Pending'}
                                </Badge>
                            </div>
                            <CardDescription>{project.serviceType.replace(/-/g, ' ')}</CardDescription>
                        </CardHeader>
                         <CardContent className="flex-grow flex flex-col">
                            <p className="text-sm text-muted-foreground flex-grow">
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
