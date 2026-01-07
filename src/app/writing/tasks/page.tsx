

'use client';

import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, writeBatch, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { Task, Project } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, ClipboardList, AlertCircle, Check } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState<Error | null>(null);

  const projectIds = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    return Array.from(new Set(tasks.map(t => t.projectId)));
  }, [tasks]);

  const projectsQuery = useMemo(() => {
    if (!firestore || projectIds.length === 0) return null;
    // Firestore 'in' query is limited to 30 items. If you expect more, pagination is needed.
    return query(collection(firestore, 'projects'), where('__name__', 'in', projectIds));
  }, [firestore, projectIds]);


  const { data: projects, loading: loadingProjects } = useCollection<Project>(projectsQuery);

  const loading = loadingTasks || loadingProjects || userLoading;
  
  const fetchTasks = async () => {
    if (!firestore || !user) {
        if (!userLoading) {
            setLoadingTasks(false);
        }
        return;
    };
    setLoadingTasks(true);
    setTasksError(null);
    try {
        const tasksQuery = query(
            collection(firestore, 'tasks'), 
            where('assignedTo', '==', user.uid)
        );
        const querySnapshot = await getDocs(tasksQuery);
        const fetchedTasks = querySnapshot.docs.map(doc => ({ ...doc.data() as Task, id: doc.id }));
        
        const activeTasks = fetchedTasks.filter(task => task.status !== 'completed');
        
        activeTasks.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
        
        setTasks(activeTasks);
    } catch (error: any) {
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: `tasks`,
                operation: 'list',
            }, error);
            errorEmitter.emit('permission-error', permissionError);
        }
        console.error("Failed to fetch tasks:", error);
        setTasksError(error);
    } finally {
        setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, user, userLoading]);

  const projectsMap = useMemo(() => {
    if (!projects) return new Map();
    return new Map(projects.map((project) => [project.id, project]));
  }, [projects]);
  
  const handleCompleteTask = async (task: Task) => {
      if (!firestore || !task.id || !task.projectId) return;

      const taskRef = doc(firestore, 'tasks', task.id);
      const projectRef = doc(firestore, 'projects', task.projectId);

      try {
          // Perform sequential updates instead of a batch
          await updateDoc(taskRef, {
              status: 'completed',
              updatedAt: serverTimestamp(),
          });

          await updateDoc(projectRef, {
              status: 'completed',
              updatedAt: serverTimestamp(),
          });

          toast({
              title: 'Project Completed!',
              description: 'The project status has been updated.',
          });
          fetchTasks(); // Re-fetch tasks to update the UI
          
      } catch (error: any) {
          // It's harder to provide perfect contextual error for sequential writes,
          // but we can still try to give a meaningful message.
          const permissionError = new FirestorePermissionError({
              path: `tasks/${task.id} or projects/${task.projectId}`,
              operation: 'update',
              requestResourceData: { status: 'completed' },
          }, error);
          errorEmitter.emit('permission-error', permissionError);
      }
  };

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
          ) : tasksError ? (
             <div className="text-center p-12 text-destructive">
                <AlertCircle className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">Failed to Load Tasks</h3>
                <p>{tasksError.message}</p>
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
                            <Button size="sm" onClick={() => handleCompleteTask(task)}>
                                <Check className="mr-2 h-4 w-4" />
                                Mark as Complete
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

    
