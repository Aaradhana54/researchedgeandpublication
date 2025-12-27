
'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
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

  const projectsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'projects'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, [firestore]);

  const { data: projects, loading: loadingProjects } = useCollection<Project>(projectsQuery);
  const { data: users, loading: loadingUsers } = useCollection<UserProfile>(usersQuery);

  const loading = loadingProjects || loadingUsers;

  const usersMap = useMemo(() => {
    if (!users) return new Map();
    return new Map(users.map((user) => [user.uid, user]));
  }, [users]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Projects</h1>
        <p className="text-muted-foreground">A comprehensive list of all projects on the platform.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Client Projects</CardTitle>
          <CardDescription>
            Review project details to understand client needs and progress.
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => {
                  if (!project.id) return null;
                  const client = usersMap.get(project.userId);
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        {/* Link to the admin project detail page as sales might need to view it */}
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
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-12 text-muted-foreground">
                <FolderKanban className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Projects Found</h3>
                <p>Clients have not submitted any projects yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
