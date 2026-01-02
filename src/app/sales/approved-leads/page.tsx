
'use client';

import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
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
  const { user, loading: userLoading } = useUser();

  const [projects, setProjects] = useState<Project[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, UserProfile>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !firestore || !user) {
        if (!userLoading) setLoading(false);
        return;
    }

    const fetchApprovedLeads = async () => {
        setLoading(true);
        try {
            const projectsQuery = query(
                collection(firestore, 'projects'),
                where('finalizedBy', '==', user.uid),
                where('status', 'in', ['approved', 'in-progress', 'completed'])
            );
            const projectsSnap = await getDocs(projectsQuery);
            const fetchedProjects = projectsSnap.docs.map(doc => ({...doc.data() as Project, id: doc.id}));

            const userIds = new Set<string>();
            fetchedProjects.forEach(p => {
                if(p.userId) userIds.add(p.userId);
            });
            
            const newUsersMap = new Map<string, UserProfile>();
            if (userIds.size > 0) {
                 // Firestore 'in' query supports up to 30 elements
                 const userIdsArray = Array.from(userIds);
                 for (let i = 0; i < userIdsArray.length; i += 30) {
                    const chunk = userIdsArray.slice(i, i + 30);
                    const usersQuery = query(collection(firestore, 'users'), where('uid', 'in', chunk));
                    const usersSnap = await getDocs(usersQuery);
                    usersSnap.forEach(doc => {
                        newUsersMap.set(doc.id, doc.data() as UserProfile);
                    });
                 }
            }
            
            setProjects(fetchedProjects);
            setUsersMap(newUsersMap);

        } catch (error) {
            console.error("Error fetching approved leads:", error);
        } finally {
            setLoading(false);
        }
    }

    fetchApprovedLeads();
  }, [firestore, user, userLoading]);

  const sortedProjects = useMemo(() => {
    if (!projects) return [];
    return [...projects].sort((a, b) => {
        if (!a.finalizedAt) return 1;
        if (!b.finalizedAt) return -1;
        return b.finalizedAt.toDate().getTime() - a.finalizedAt.toDate().getTime()
    });
  }, [projects]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Approved Leads</h1>
        <p className="text-muted-foreground">Monitor projects that you have successfully finalized.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Finalized Projects</CardTitle>
          <CardDescription>
            These are the deals that you have finalized and are ready for the next stage.
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
                  const client = usersMap.get(project.userId);
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        <Link href={`/sales/projects/${project.id}`} className="hover:underline text-primary">
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
                <p>You have not finalized any deals yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
