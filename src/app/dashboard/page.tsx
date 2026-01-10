
'use client';

import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus, LoaderCircle, ArrowRight, FolderKanban } from 'lucide-react';
import { SelectProjectTypeDialog } from '@/components/dashboard/select-project-type-dialog';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useMemo } from 'react';
import type { Project } from '@/lib/types';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const allProjectsQuery = useMemo(() => {
     if (!user || !firestore) return null;
     return query(collection(firestore, 'projects'), where('userId', '==', user.uid));
  }, [user, firestore]);

  const { data: allProjects, loading } = useCollection<Project>(allProjectsQuery);
  
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
      <div className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground rounded-xl p-8 shadow-lift flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">
            {isNewUser ? `Welcome, ${user.name}!` : `Welcome back, ${user.name}!`}
            </h1>
            <p className="text-lg text-primary-foreground/80 mt-2">
            {isNewUser
                ? "Let's get your first project started."
                : "Here's a quick overview of your account."}
            </p>
        </div>
        <SelectProjectTypeDialog>
            <Button size="lg" variant="secondary" className="hidden sm:flex">
                <FilePlus className="mr-2" />
                New Project
            </Button>
        </SelectProjectTypeDialog>
      </div>

      {isNewUser ? (
        <div className="text-center border-2 border-dashed rounded-lg p-12 space-y-4 bg-background">
            <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground"/>
            <h3 className="text-xl font-semibold">Start a New Project</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You have no active projects yet. Get started by submitting the details of your research or publication needs.
            </p>
            <div className="pt-2">
                <SelectProjectTypeDialog>
                  <Button size="lg">
                    <FilePlus className="mr-2" />
                    Add New Project
                  </Button>
                </SelectProjectTypeDialog>
            </div>
        </div>
      ) : (
         <div className="space-y-6">
             <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Recent Projects</h2>
                     <p className="text-muted-foreground">Here are your most recently submitted projects.</p>
                </div>
                 <Button asChild variant="outline">
                    <Link href="/dashboard/projects">View All <ArrowRight className="ml-2"/></Link>
                </Button>
             </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayedProjects && displayedProjects.map((project) => (
                    <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="block">
                      <Card className="hover:shadow-lift hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                          <CardHeader>
                              <div className="flex justify-between items-start gap-2">
                                  <CardTitle className="flex-1 leading-snug">{project.title}</CardTitle>
                                  <Badge variant={getProjectStatusVariant(project.status)} className="capitalize shrink-0">
                                      {project.status || 'Pending'}
                                  </Badge>
                              </div>
                          </CardHeader>
                           <CardContent className="flex-grow">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                  {project.serviceType.replace(/-/g, ' ')}
                              </p>
                          </CardContent>
                          <CardFooter className="text-xs text-muted-foreground">
                             Submitted on {format(project.createdAt.toDate(), 'PPP')}
                          </CardFooter>
                      </Card>
                    </Link>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}

    