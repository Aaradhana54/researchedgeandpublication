
'use client';

import { useMemo }from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, CheckCircle } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { UserProfile, Project } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ConvertedLeadsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  // Get all users referred by the partner
  const referredUsersQuery = useMemo(() => {
    if (!user || !firestore || !user.referralCode) return null;
    return query(collection(firestore, 'users'), where('referredBy', '==', user.referralCode));
  }, [user, firestore]);

  const { data: referredUsers, loading: referralsLoading } = useCollection<UserProfile>(referredUsersQuery);

  const referredUserIds = useMemo(() => {
    if (!referredUsers || referredUsers.length === 0) return [];
    return referredUsers.map(u => u.uid);
  }, [referredUsers]);


  // Get all projects, which we will filter on the client
  const allProjectsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'projects'), where('status', 'in', ['approved', 'in-progress', 'completed']));
  }, [firestore]);

  const { data: allProjects, loading: projectsLoading } = useCollection<Project>(allProjectsQuery);
  const { data: allUsers, loading: usersLoading } = useCollection<UserProfile>(query(collection(firestore, 'users')));


  const loading = userLoading || referralsLoading || projectsLoading || usersLoading;
  
  const convertedProjects = useMemo(() => {
    if (!allProjects || !user) return [];
    
    // Filter projects that are either from a registered referred user OR from a manually converted lead
    const partnerProjects = allProjects.filter(p => 
      (referredUserIds.includes(p.userId)) || 
      (p.referredByPartnerId === user.uid)
    );

    return partnerProjects.sort((a,b) => b.finalizedAt!.toDate().getTime() - a.finalizedAt!.toDate().getTime());

  }, [allProjects, user, referredUserIds]);

  const usersMap = useMemo(() => {
    if (!allUsers) return new Map();
    return new Map(allUsers.map(u => [u.uid, u]));
  }, [allUsers]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Converted Leads</h1>
        <p className="text-muted-foreground">A list of your referrals that have been converted into approved projects.</p>
      </div>
       <Card>
            <CardHeader>
                <CardTitle>Your Converted Projects</CardTitle>
                <CardDescription>You earn commission for each of these finalized deals.</CardDescription>
            </CardHeader>
            <CardContent>
                {convertedProjects && convertedProjects.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project Title</TableHead>
                                <TableHead>Client Name</TableHead>
                                <TableHead>Date Finalized</TableHead>
                                <TableHead className="text-right">Deal Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {convertedProjects.map(project => {
                                const client = usersMap.get(project.userId);
                                return (
                                <TableRow key={project.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/admin/projects/${project.id}`} className="hover:underline text-primary">
                                            {project.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {client?.name || 'Unregistered Client'}
                                    </TableCell>
                                    <TableCell>
                                        {project.finalizedAt ? format(project.finalizedAt.toDate(), 'PPP') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {project.dealAmount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) || 'N/A'}
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                ) : (
                     <div className="text-center p-12 text-muted-foreground">
                        <CheckCircle className="mx-auto w-10 h-10 mb-4" />
                        <h3 className="text-lg font-semibold">No Converted Leads Yet</h3>
                        <p className="text-sm">When a client you refer starts a project, it will appear here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
