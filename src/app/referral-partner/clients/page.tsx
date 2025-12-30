
'use client';

import { useMemo }from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Users } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

export default function ReferredClientsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  // 1. Find all users referred by the current partner
  const referredUsersQuery = useMemo(() => {
    if (!user || !firestore || !user.referralCode) return null;
    return query(collection(firestore, 'users'), where('referredBy', '==', user.referralCode));
  }, [user, firestore]);

  const { data: referredUsers, loading: referralsLoading } = useCollection<UserProfile>(referredUsersQuery);
  
  // 2. Get the IDs of the referred users
  const referredUserIds = useMemo(() => {
    if (!referredUsers || referredUsers.length === 0) return [];
    return referredUsers.map(u => u.uid);
  }, [referredUsers]);

  // 3. Find all projects created by those referred users to check for conversion
  const projectsOfReferredUsersQuery = useMemo(() => {
    if (!firestore || referredUserIds.length === 0) return null;
    return query(collection(firestore, 'projects'), where('userId', 'in', referredUserIds));
  }, [firestore, referredUserIds]);

  const { data: projects, loading: projectsLoading } = useCollection<Project>(projectsOfReferredUsersQuery);

  const loading = userLoading || referralsLoading || projectsLoading;

  const convertedUserIds = useMemo(() => {
    if (!projects) return new Set();
    return new Set(projects.map(p => p.userId));
  }, [projects]);

  const sortedUsers = useMemo(() => {
    if (!referredUsers) return [];
    return [...referredUsers].sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
  }, [referredUsers]);


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
        <h1 className="text-3xl font-bold tracking-tight">Referred Clients</h1>
        <p className="text-muted-foreground">A list of all clients who have signed up using your referral code.</p>
      </div>
       <Card>
            <CardHeader>
                <CardTitle>Your Referred Clients</CardTitle>
                <CardDescription>This table shows every client who has joined via your referral link.</CardDescription>
            </CardHeader>
            <CardContent>
                {sortedUsers && sortedUsers.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Client Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Date Joined</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedUsers.map(client => (
                                <TableRow key={client.uid}>
                                    <TableCell className="font-medium">{client.name}</TableCell>
                                    <TableCell>
                                        <div>{client.email}</div>
                                    </TableCell>
                                    <TableCell>{client.createdAt ? format(client.createdAt.toDate(), 'PPP') : 'N/A'}</TableCell>
                                     <TableCell>
                                         {convertedUserIds.has(client.uid) ? (
                                             <Badge variant="default" className="capitalize">Converted</Badge>
                                         ) : (
                                            <Badge variant="secondary" className="capitalize">Signed Up</Badge>
                                         )}
                                     </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                     <div className="text-center p-12 text-muted-foreground">
                        <Users className="mx-auto w-10 h-10 mb-4" />
                        <h3 className="text-lg font-semibold">No Clients Referred Yet</h3>
                        <p className="text-sm">Share your referral link from the dashboard to start earning commissions.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
