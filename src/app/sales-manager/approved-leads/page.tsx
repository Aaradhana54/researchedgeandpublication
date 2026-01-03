
'use client';

import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { Project, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, CheckCircle } from 'lucide-react';
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

  const [projects, setProjects] = useState<Project[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, UserProfile>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch approved projects
        const projectsQuery = query(
          collection(firestore, 'projects'),
          where('status', 'in', ['approved', 'in-progress', 'completed'])
        );
        const projectsSnap = await getDocs(projectsQuery);
        const fetchedProjects = projectsSnap.docs.map(doc => ({ ...doc.data() as Project, id: doc.id }));
        setProjects(fetchedProjects);

        // 2. Gather unique user IDs from the projects
        const userIds = new Set<string>();
        fetchedProjects.forEach(p => {
          if (p.userId && !p.userId.startsWith('unregistered_')) {
            userIds.add(p.userId);
          }
        });
        
        // 3. Fetch only the necessary users
        const newUsersMap = new Map<string, UserProfile>();
        if (userIds.size > 0) {
          const userIdsArray = Array.from(userIds);
          // Firestore 'in' query supports up to 30 elements
          for (let i = 0; i < userIdsArray.length; i += 30) {
            const chunk = userIdsArray.slice(i, i + 30);
            const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', chunk));
            const usersSnap = await getDocs(usersQuery);
            usersSnap.forEach(doc => {
              newUsersMap.set(doc.id, { ...doc.data() as UserProfile, uid: doc.id });
            });
          }
        }
        setUsersMap(newUsersMap);

      } catch (error) {
        console.error("Error fetching approved leads data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [firestore]);


  const sortedProjects = useMemo(() => {
    if (!projects) return [];
    // Sort projects by creation date on the client side
    return [...projects].sort((a, b) => {
        if (!a.finalizedAt) return 1;
        if (!b.finalizedAt) return -1;
        return b.finalizedAt.toDate().getTime() - a.finalizedAt.toDate().getTime()
    });
  }, [projects]);
  
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
        <p className="text-muted-foreground">Monitor projects that have been approved.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Approved Projects</CardTitle>
          <CardDescription>
            These are the deals that have been finalized and are ready for the next stage.
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProjects.map((project) => {
                  if (!project.id) return null;
                  const client = getClientInfo(project);
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        <Link href={`/sales-manager/leads/${project.id}?type=project`} className="hover:underline text-primary">
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
                           <Badge variant={getProjectStatusVariant(project.status)} className="capitalize">
                            {project.status || 'Pending'}
                           </Badge>
                       </TableCell>
                       <TableCell className="text-right">
                            <SendApprovalEmailButton project={project} client={client} />
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
