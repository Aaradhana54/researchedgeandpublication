
'use client';

import { useMemo } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Users } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { UserProfile, Project, ContactLead } from '@/lib/types';
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

type CombinedReferral = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    referredAt: Date;
    status: 'Signed Up' | 'Converted' | 'Submitted Lead';
}

export default function ReferredClientsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  // 1. Find all users who signed up with the partner's referral code
  const referredUsersQuery = useMemo(() => {
    if (!user || !firestore || !user.referralCode) return null;
    return query(collection(firestore, 'users'), where('referredBy', '==', user.referralCode));
  }, [user, firestore]);

  // 2. Find all leads submitted by the partner
  const submittedLeadsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'contact_leads'), where('referredByPartnerId', '==', user.uid));
  }, [user, firestore]);

  const { data: referredUsers, loading: referralsLoading } = useCollection<UserProfile>(referredUsersQuery);
  const { data: submittedLeads, loading: leadsLoading } = useCollection<ContactLead>(submittedLeadsQuery);

  const referredUserIds = useMemo(() => {
      if (!referredUsers) return [];
      return referredUsers.map(u => u.uid);
  }, [referredUsers]);

  // 3. Find projects ONLY for the users this partner has referred
  const projectsQuery = useMemo(() => {
    if (!firestore || referredUserIds.length === 0) return null;
    // We fetch all projects with a status beyond 'pending' to check for conversions.
    return query(
        collection(firestore, 'projects'), 
        where('userId', 'in', referredUserIds),
        where('status', 'in', ['approved', 'in-progress', 'completed'])
    );
  }, [firestore, referredUserIds]);

  const { data: projects, loading: projectsLoading } = useCollection<Project>(projectsQuery);

  const loading = userLoading || referralsLoading || leadsLoading || projectsLoading;
  
  const combinedReferrals = useMemo((): CombinedReferral[] => {
    const referrals: CombinedReferral[] = [];
    const convertedUserIds = new Set(projects?.map(p => p.userId));

    // Process users who signed up
    referredUsers?.forEach(u => {
        referrals.push({
            id: u.uid,
            name: u.name,
            email: u.email,
            phone: u.mobile,
            referredAt: u.createdAt.toDate(),
            status: convertedUserIds.has(u.uid) ? 'Converted' : 'Signed Up',
        });
    });

    // Process leads submitted by partner
    submittedLeads?.forEach(l => {
        // A submitted lead is not yet linked to a user account, so it can't be 'Converted' here.
        referrals.push({
            id: l.id!,
            name: l.name,
            email: l.email,
            phone: l.phone,
            referredAt: l.createdAt.toDate(),
            status: 'Submitted Lead',
        });
    });

    // Sort combined list by date
    return referrals.sort((a,b) => b.referredAt.getTime() - a.referredAt.getTime());

  }, [referredUsers, submittedLeads, projects]);


  const getStatusVariant = (status: CombinedReferral['status']) => {
      switch(status) {
          case 'Converted': return 'default';
          case 'Signed Up': return 'secondary';
          case 'Submitted Lead': return 'outline';
          default: return 'outline';
      }
  }


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
        <h1 className="text-3xl font-bold tracking-tight">Your Referrals</h1>
        <p className="text-muted-foreground">A list of all clients who signed up or were submitted by you.</p>
      </div>
       <Card>
            <CardHeader>
                <CardTitle>All Referred Clients & Leads</CardTitle>
                <CardDescription>This table shows everyone referred by you, either via sign-up or manual submission.</CardDescription>
            </CardHeader>
            <CardContent>
                {combinedReferrals && combinedReferrals.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Client Name</TableHead>
                                <TableHead>Contact Info</TableHead>
                                <TableHead>Date Referred</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {combinedReferrals.map(client => (
                                <TableRow key={client.id}>
                                    <TableCell className="font-medium">{client.name}</TableCell>
                                    <TableCell>
                                        <div>{client.email}</div>
                                        {client.phone && <div className="text-sm text-muted-foreground">{client.phone}</div>}
                                    </TableCell>
                                    <TableCell>{format(client.referredAt, 'PPP')}</TableCell>
                                     <TableCell>
                                        <Badge variant={getStatusVariant(client.status)} className="capitalize">{client.status}</Badge>
                                     </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                     <div className="text-center p-12 text-muted-foreground">
                        <Users className="mx-auto w-10 h-10 mb-4" />
                        <h3 className="text-lg font-semibold">No Referrals Yet</h3>
                        <p className="text-sm">Share your referral link or submit a lead from the dashboard to start earning commissions.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
