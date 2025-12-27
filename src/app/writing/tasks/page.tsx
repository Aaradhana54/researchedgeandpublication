
'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { Task, Project, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, ClipboardList, AlertCircle } from 'lucide-react';
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
import { Button } from '@/components/ui/button';


const getTaskStatusVariant = (status?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'in-progress':
      return 'secondary';
    case 'completed':
      return 'default';
    case 'pending':
      return 'outline';
    default:
      return 'outline';
  }
};


export default function MyTasksPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const tasksQuery = useMemo(() => {
    if (!firestore || !user) return null;
    // This query is now secured by the updated Firestore rules.
    // The rule ensures a writer can only list tasks where `assignedTo` is their own UID.
    return query(
        collection(firestore, 'tasks'), 
        where('assignedTo', '==', user.uid),
        orderBy('createdAt', 'desc') 
    );
  }, [firestore, user]);

  // We need to fetch all projects to map task.projectId to project details.
  // This is less efficient, but necessary without complex joins.
  // Security rules must allow writers to list projects.
  const projectsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'projects'));
  }, [firestore]);


  const { data: tasks, loading: loadingTasks, error: tasksError } = useCollection<Task>(tasksQuery);
  const { data: projects, loading: loadingProjects } = useCollection<Project>(projectsQuery);

  const loading = loadingTasks || loadingProjects || userLoading;

  const projectsMap = useMemo(() => {
    if (!projects) return new Map();
    return new Map(projects.map((project) => [project.id, project]));
  }, [projects]);
  

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
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground">A list of all projects assigned to you.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Assigned Projects</CardTitle>
          <CardDescription>
            These are the projects you are currently assigned to work on.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : tasks && tasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  if (!task.id) return null;
                  const project = projectsMap.get(task.projectId);
                  return (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        {project?.title || 'Loading project...'}
                      </TableCell>
                       <TableCell>
                           <Badge variant="secondary" className="capitalize">
                            {project?.serviceType.replace(/-/g, ' ') || 'N/A'}
                           </Badge>
                       </TableCell>
                       <TableCell>
                           <Badge variant={getTaskStatusVariant(task.status)} className="capitalize">
                            {task.status}
                           </Badge>
                       </TableCell>
                      <TableCell>
                        {task.dueDate ? format(task.dueDate.toDate(), 'PPP') : 'Not set'}
                      </TableCell>
                       <TableCell className="text-right">
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/admin/projects/${task.projectId}`}>View Project</Link>
                            </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-12 text-muted-foreground">
                <ClipboardList className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Tasks Assigned</h3>
                <p>You have no projects assigned to you at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
