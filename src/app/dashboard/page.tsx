
'use client';

import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus, LoaderCircle, ArrowRight } from 'lucide-react';
import { SelectProjectTypeDialog } from '@/components/dashboard/select-project-type-dialog';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useMemo } from 'react';
import type { Project } from '@/lib/types';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const allProjectsQuery = useMemo(() => {
     if (!user || !firestore) return null;
     return query(collection(firestore, 'projects'), where('userId', '==', user.uid));
  }, [user, firestore]);

  const { data: allProjects, loading } = useCollection<Project>(allProjectsQuery);
  
  // Sort and limit projects on the client to avoid composite index
  const displayedProjects = useMemo(() => {
    if (!allProjects) return [];
    return allProjects
      .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime())
      .slice(0, 3);
  }, [allProjects]);

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
    <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 dashboard-bg">
      <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 shadow-soft border">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          {isNewUser ? `Welcome, ${user.name}!` : `Welcome back, ${user.name}!`}
        </h1>
        <p className="text-lg text-muted-foreground">
          {isNewUser
            ? "Let's get your first project started."
            : "Here's a quick overview of your account."}
        </p>
      </div>

      {isNewUser ? (
        <Card className="w-full max-w-2xl shadow-lift border-primary border-2">
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
                        <CardFooter>
                           <Button variant="ghost" size="sm" asChild className="ml-auto">
                             <Link href={`/dashboard/projects/${project.id}`}>
                               View Details <ArrowRight className="ml-2"/>
                             </Link>
                           </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}

    