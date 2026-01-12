
'use client';

import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useCollection } from '@/firebase';
import type { Task, Project } from '@/lib/types';
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
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


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
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const projectsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, 'projects'),
        where('assignedWriterId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: projects, loading: loadingProjects, error: projectsError } = useCollection<Project>(projectsQuery);

  useEffect(() => {
      if (projectsError) {
          setError(projectsError);
      }
  }, [projectsError]);

  useEffect(() => {
    if (!firestore || !projects) {
        if(!loadingProjects) setLoadingTasks(false);
        return;
    }

    const fetchTasksForProjects = async () => {
        if (projects.length === 0) {
            setTasks([]);
            setLoadingTasks(false);
            return;
        }

        setLoadingTasks(true);
        try {
            const projectIds = projects.map(p => p.id);
            const fetchedTasks: Task[] = [];
            
            // Query for all tasks related to the user's assigned projects
            const tasksQuery = query(collection(firestore, 'tasks'), where('projectId', 'in', projectIds));
            const tasksSnapshot = await getDocs(tasksQuery);

            tasksSnapshot.forEach(doc => {
                const task = { ...doc.data() as Task, id: doc.id };
                // Also ensure the task is assigned to the current user
                if (task.assignedTo === user?.uid) {
                    fetchedTasks.push(task);
                }
            });
            
            const activeTasks = fetchedTasks
              .filter(task => task.status === 'pending' || task.status === 'in-progress')
              .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());

            setTasks(activeTasks);

        } catch (err: any) {
            console.error("Failed to fetch tasks for projects:", err);
            setError(err);
        } finally {
            setLoadingTasks(false);
        }
    };
    
    fetchTasksForProjects();

  }, [firestore, projects, user?.uid, loadingProjects]);
  
  const projectsMap = useMemo(() => {
    if (!projects) return new Map();
    return new Map(projects.map((project) => [project.id, project]));
  }, [projects]);
  

  const loading = userLoading || loadingProjects || loadingTasks;

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
        <p className="text-muted-foreground">A list of all active projects assigned to you.</p>
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
          ) : error ? (
             <div className="text-center p-12 text-destructive">
                <AlertCircle className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">Failed to Load Tasks</h3>
                <p>{error.message}</p>
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
                       <TableCell className="text-right space-x-2">
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/writing/projects/${task.projectId}`}>View Details</Link>
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
