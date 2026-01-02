
'use client';

import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, getDocs, type Query, type DocumentData } from 'firebase/firestore';
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
  const [usersMap, setUsersMap] = useState<Map<string, UserProfile>>(new Map());
  const [loadingUsers, setLoadingUsers] = useState(true);

  const projectsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'projects'), 
        where('status', '==', 'approved')
    );
  }, [firestore]);
  
  const { data: projects, loading: loadingProjects } = useCollection<Project>(projectsQuery);

  useEffect(() => {
    if (!firestore || !projects || projects.length === 0) {
      if (!loadingProjects) setLoadingUsers(false);
      return;
    }

    const fetchUsers = async () => {
      setLoadingUsers(true);
      const userIds = Array.from(new Set(projects.map(p => p.userId).filter(Boolean)));
      const newUsersMap = new Map<string, UserProfile>();
      
      if (userIds.length > 0) {
        // Fetch users in chunks of 10 to satisfy Firestore 'in' query limit
        const chunks = [];
        for (let i = 0; i < userIds.length; i += 10) {
            chunks.push(userIds.slice(i, i + 10));
        }

        for (const chunk of chunks) {
            const usersQuery = query(collection(firestore, 'users'), where('uid', 'in', chunk));
            const querySnapshot = await getDocs(usersQuery);
            querySnapshot.forEach(doc => {
                newUsersMap.set(doc.id, doc.data() as UserProfile);
            });
        }
      }
      setUsersMap(newUsersMap);
      setLoadingUsers(false);
    };

    fetchUsers();

  }, [firestore, projects, loadingProjects]);


  const loading = loadingProjects || loadingUsers;
  
  const sortedProjects = useMemo(() => {
    if (!projects) return [];
    return [...projects].sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
  }, [projects]);

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
                  <TableHead>Advance Paid</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProjects.map((project) => {
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
