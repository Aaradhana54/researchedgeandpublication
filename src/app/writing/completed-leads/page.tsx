
'use client';

import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useCollection } from '@/firebase';
import type { Task, Project } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, ClipboardList, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';

export default function CompletedTasksPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const tasksQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'tasks'), 
      where('assignedTo', '==', user.uid),
      where('status', '==', 'completed')
    );
  }, [firestore, user]);

  const { data: tasks, loading: loadingTasks, error: tasksError } = useCollection<Task>(tasksQuery);

  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    return [...tasks].sort((a, b) => {
        if (!a.updatedAt) return 1;
        if (!b.updatedAt) return -1;
        return b.updatedAt.toDate().getTime() - a.updatedAt.toDate().getTime();
    });
  }, [tasks]);

  useEffect(() => {
    if (tasksError) {
      setError(tasksError);
    }
  }, [tasksError]);


  useEffect(() => {
    if (!firestore || !tasks) {
      setLoadingProjects(false);
      return;
    }

    const fetchProjects = async () => {
        if (tasks.length === 0) {
            setProjects([]);
            setLoadingProjects(false);
            return;
        }

        setLoadingProjects(true);
        try {
            const projectIds = Array.from(new Set(tasks.map(t => t.projectId)));
            const fetchedProjects: Project[] = [];

            // Firestore 'in' query is limited to 30 items.
            // We fetch projects in chunks to stay within this limit and comply with security rules.
            const projectChunks: string[][] = [];
            for (let i = 0; i < projectIds.length; i += 30) {
                projectChunks.push(projectIds.slice(i, i + 30));
            }

            for (const chunk of projectChunks) {
                if (chunk.length > 0) {
                    const projectsQuery = query(collection(firestore, 'projects'), where('__name__', 'in', chunk));
                    const projectsSnapshot = await getDocs(projectsQuery);
                    projectsSnapshot.forEach(doc => {
                        fetchedProjects.push({ ...doc.data() as Project, id: doc.id });
                    });
                }
            }
            setProjects(fetchedProjects);
        } catch (err: any) {
            console.error("Failed to fetch completed task projects:", err);
            setError(err);
        } finally {
            setLoadingProjects(false);
        }
    };
    
    fetchProjects();

  }, [firestore, tasks]);


  const projectsMap = useMemo(() => {
    if (!projects) return new Map();
    return new Map(projects.map((project) => [project.id, project]));
  }, [projects]);
  

  const loading = userLoading || loadingTasks || loadingProjects;

  if (!user && !userLoading) {
      return (
         <div className="flex justify-center items-center h-full p-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Authentication Error</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4"/>
                    <p className="text-muted-foreground">Could not load user data. Please try logging out and back in.</p>
                </CardContent>
            </Card>
        </div>
      );
  }


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Completed Tasks</h1>
        <p className="text-muted-foreground">A history of all the tasks you have completed.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Completed Work</CardTitle>
          <CardDescription>
            This is a list of all projects you have marked as complete.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
             <div className="text-center p-12 text-destructive">
                <AlertCircle className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">Failed to Load Tasks</h3>
                <p>{error.message}</p>
            </div>
          ) : sortedTasks && sortedTasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Completed</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTasks.map((task) => {
                  if (!task.id) return null;
                  const project = projectsMap.get(task.projectId);
                  return (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium break-words">
                        {project?.title || 'Loading project...'}
                      </TableCell>
                       <TableCell>
                           <Badge variant="secondary" className="capitalize">
                            {project?.serviceType.replace(/-/g, ' ') || 'N/A'}
                           </Badge>
                       </TableCell>
                       <TableCell>
                           <Badge variant="default" className="capitalize">
                            {task.status}
                           </Badge>
                       </TableCell>
                      <TableCell>
                        {task.updatedAt ? format(task.updatedAt.toDate(), 'PPP') : 'Not set'}
                      </TableCell>
                       <TableCell className="text-right">
                           <Link href={`/writing/projects/${task.projectId}`} className="text-primary hover:underline text-sm font-medium">View Project</Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-12 text-muted-foreground">
                <CheckCircle2 className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Completed Tasks</h3>
                <p>You have not completed any tasks yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
