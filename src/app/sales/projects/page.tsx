
'use client';

import { useMemo } from 'react';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { Project, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, FolderKanban } from 'lucide-react';
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
import { FinalizeDealDialog } from '@/components/sales/finalize-deal-dialog';

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

export default function SalesProjectsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const projectsQuery = useMemo(() => {
    if (!firestore) return null;
    // Query for all pending projects. Sales team can see all new leads.
    return query(
        collection(firestore, 'projects'), 
        where('status', '==', 'pending')
    );
  }, [firestore]);

  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, [firestore]);

  const { data: projectsData, loading: loadingProjects } = useCollection<Project>(projectsQuery);
  const { data: users, loading: loadingUsers } = useCollection<UserProfile>(usersQuery);

  const projects = useMemo(() => {
    if (!projectsData) return [];
    // Client-side filtering to only show projects from actual clients (not partner/website leads converted to projects)
    const clientProjects = projectsData.filter(p => !p.userId.startsWith('unregistered_'));
    return clientProjects.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
  }, [projectsData]);

  const loading = loadingProjects || loadingUsers;

  const usersMap = useMemo(() => {
    if (!users) return new Map();
    return new Map(users.map((user) => [user.uid, user]));
  }, [users]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New Client Leads</h1>
        <p className="text-muted-foreground">A list of all new leads submitted directly by clients.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New Client Leads</CardTitle>
          <CardDescription>
            Review these new leads to understand client needs and finalize deals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : projects && projects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => {
                  if (!project.id) return null;
                  const client = usersMap.get(project.userId);
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
                           <Badge variant="secondary" className="capitalize">
                            {project.serviceType.replace(/-/g, ' ')}
                           </Badge>
                       </TableCell>
                       <TableCell>
                           <Badge variant={getProjectStatusVariant(project.status)} className="capitalize">
                            {project.status || 'Pending'}
                           </Badge>
                       </TableCell>
                      <TableCell>
                        {project.createdAt ? format(project.createdAt.toDate(), 'PPP') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                         {project.status === 'pending' && (
                            <FinalizeDealDialog project={project}>
                                <Button size="sm">Finalize</Button>
                            </FinalizeDealDialog>
                         )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-12 text-muted-foreground">
                <FolderKanban className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No New Client Leads</h3>
                <p>There are no new client-submitted leads at this time.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
