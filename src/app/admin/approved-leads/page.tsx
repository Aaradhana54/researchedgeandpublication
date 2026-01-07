
'use client';

import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, updateDoc, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { Project, UserProfile, Task } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, CheckCircle, User as UserIcon } from 'lucide-react';
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
import { AssignWriterDialog } from '@/components/admin/assign-writer-dialog';
import { useToast } from '@/hooks/use-toast';
import { CreateClientAccountDialog } from '@/components/referral-partner/create-client-account-dialog';
import { SendApprovalEmailButton } from '@/components/sales/send-approval-email-button';

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
};

export default function ApprovedLeadsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [writingTeam, setWritingTeam] = useState<UserProfile[]>([]);

  const fetchApprovedLeadsData = async () => {
    if (!firestore) return;
    setLoading(true);

    try {
        // Fetch projects
        const projectsQuery = query(
            collection(firestore, 'projects'), 
            where('status', 'in', ['approved', 'in-progress'])
        );
        const projectsSnap = await getDocs(projectsQuery);
        const fetchedProjects = projectsSnap.docs.map(doc => ({ ...doc.data() as Project, id: doc.id }));
        setProjects(fetchedProjects);

        // Fetch all users to check for existing emails and get roles
        const usersQuery = query(collection(firestore, 'users'));
        const usersSnap = await getDocs(usersQuery);
        const fetchedUsers: UserProfile[] = [];
        const writers: UserProfile[] = [];
        usersSnap.forEach(doc => {
            const userData = { ...doc.data() as UserProfile, uid: doc.id };
            fetchedUsers.push(userData);
            if (userData.role === 'writing-team') {
                writers.push(userData);
            }
        });
        setUsers(fetchedUsers);
        setWritingTeam(writers);

        // Fetch tasks
        const tasksQuery = query(collection(firestore, 'tasks'));
        const tasksSnap = await getDocs(tasksQuery);
        const fetchedTasks = tasksSnap.docs.map(doc => ({ ...doc.data() as Task, id: doc.id }));
        setTasks(fetchedTasks);

    } catch (error) {
        console.error("Error fetching approved leads data:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load data.'});
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    if (firestore) {
      fetchApprovedLeadsData();
    }
  }, [firestore]);


  const usersMap = useMemo(() => {
    return new Map(users.map(user => [user.uid, user]));
  }, [users]);
  
  const emailsSet = useMemo(() => {
    return new Set(users.map(user => user.email));
  }, [users]);

  const assignedTasksMap = useMemo(() => {
    if (!tasks) return new Map();
    const map = new Map<string, Task>();
    tasks.forEach(task => {
        // Assuming one writer task per project for now
        map.set(task.projectId, task);
    });
    return map;
  }, [tasks]);

  const sortedProjects = useMemo(() => {
    if (!projects) return [];
    // Sort projects by creation date on the client side
    return [...projects].sort((a, b) => (b.createdAt?.toDate()?.getTime() || 0) - (a.createdAt?.toDate()?.getTime() || 0));
  }, [projects]);

  const onTaskCreated = async (projectId: string) => {
    if (!firestore) return;
    try {
      const projectDocRef = doc(firestore, 'projects', projectId);
      await updateDoc(projectDocRef, {
        status: 'in-progress',
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'Project Updated',
        description: 'Project status has been set to "In Progress".',
      });
      fetchApprovedLeadsData(); // Re-fetch to update the UI
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating project',
        description: error.message,
      });
    }
  };

  const getClientInfo = (project: Project) => {
      if (project.userId.startsWith('unregistered_')) {
          const email = project.userId.split('_')[1];
          return { name: `Unregistered (${email})`, email: email };
      }
      return usersMap.get(project.userId) || { name: 'Unknown User', email: ''};
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Approved Leads</h1>
        <p className="text-muted-foreground">Assign approved projects to the writing team.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Approved & In-Progress Projects</CardTitle>
          <CardDescription>
            These projects are ready for assignment or are currently being worked on.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : sortedProjects && sortedProjects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Deal Value</TableHead>
                  <TableHead>Advance Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProjects.map((project) => {
                  if (!project.id) return null;
                  const client = getClientInfo(project);
                  const assignedTask = assignedTasksMap.get(project.id);
                  const assignedWriter = assignedTask ? usersMap.get(assignedTask.assignedTo) : null;
                  
                  const isUnregistered = project.userId.startsWith('unregistered_');
                  const unregisteredEmail = isUnregistered ? project.userId.split('_')[1] : null;
                  const clientAccountExists = unregisteredEmail ? emailsSet.has(unregisteredEmail) : !isUnregistered;
                  
                  const canBeAssigned = project.status === 'approved' && !assignedTask && clientAccountExists;

                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/projects/${project.id}`} className="hover:underline text-primary">
                          {project.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{client?.name || 'Unknown User'}</div>
                        <div className="text-sm text-muted-foreground">{client?.email}</div>
                      </TableCell>
                      <TableCell>
                        {project.dealAmount ? project.dealAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : 'N/A'}
                      </TableCell>
                       <TableCell>
                        {project.advanceReceived ? project.advanceReceived.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : 'N/A'}
                      </TableCell>
                       <TableCell>
                           <Badge variant={getProjectStatusVariant(project.status)} className="capitalize">
                            {project.status || 'Pending'}
                           </Badge>
                       </TableCell>
                       <TableCell>
                         {assignedWriter ? (
                            <div className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-muted-foreground" />
                                <span>{assignedWriter.name}</span>
                            </div>
                         ) : (
                            <span className="text-muted-foreground">Not Assigned</span>
                         )}
                       </TableCell>
                      <TableCell className="text-right">
                         <div className="flex justify-end items-center gap-2">
                            <SendApprovalEmailButton project={project} client={client} onEmailSent={fetchApprovedLeadsData} />
                            {isUnregistered && !clientAccountExists && (
                               <CreateClientAccountDialog project={project} onAccountCreated={fetchApprovedLeadsData} />
                            )}
                            {canBeAssigned ? (
                                <AssignWriterDialog 
                                    project={project} 
                                    writers={writingTeam}
                                    onTaskCreated={() => onTaskCreated(project.id!)}
                                >
                                    <Button size="sm">Assign</Button>
                                </AssignWriterDialog>
                            ) : null}
                         </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-12 text-muted-foreground">
                <CheckCircle className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Approved Leads</h3>
                <p>There are currently no projects with an 'approved' status.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
