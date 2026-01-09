
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Users } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, type Query, type DocumentData } from 'firebase/firestore';
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
    status: 'Signed Up' | 'Submitted Lead';
}

export default function ReferredClientsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const [referredUsers, setReferredUsers] = useState<UserProfile[]>([]);
  const [submittedLeads, setSubmittedLeads] = useState<ContactLead[]>([]);
  const [partnerProjects, setPartnerProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !firestore || !user) {
        if (!userLoading) setLoading(false);
        return;
    }

    const fetchData = async () => {
        setLoading(true);

        try {
            // Fetch users referred by code
            const referredUsersQuery = user.referralCode
                ? query(collection(firestore, 'users'), where('referredBy', '==', user.referralCode))
                : null;
            const referredUsersSnap = referredUsersQuery ? await getDocs(referredUsersQuery) : { docs: [] };
            const fetchedReferredUsers = referredUsersSnap.docs.map(d => ({ ...d.data() as UserProfile, uid: d.id }));
            setReferredUsers(fetchedReferredUsers);

            // Fetch leads submitted by partner
            const submittedLeadsQuery = query(collection(firestore, 'contact_leads'), where('referredByPartnerId', '==', user.uid));
            const submittedLeadsSnap = await getDocs(submittedLeadsQuery);
            setSubmittedLeads(submittedLeadsSnap.docs.map(d => ({ ...d.data() as ContactLead, id: d.id })));

            // Fetch all projects related to this partner to identify conversions
            const projectsByPartnerIdQuery = query(collection(firestore, 'projects'), where('referredByPartnerId', '==', user.uid));
            const projectsByPartnerIdSnap = await getDocs(projectsByPartnerIdQuery);
            const projectsMap = new Map<string, Project>();
            projectsByPartnerIdSnap.forEach(doc => projectsMap.set(doc.id, { ...doc.data() as Project, id: doc.id }));

            const referredUserIds = fetchedReferredUsers.map(u => u.uid);
            if (referredUserIds.length > 0) {
                 const projectsByUserIdsQuery = query(
                    collection(firestore, 'projects'),
                    where('userId', 'in', referredUserIds)
                );
                const projectsByUserIdsSnap = await getDocs(projectsByUserIdsQuery);
                projectsByUserIdsSnap.forEach(doc => {
                    if(!projectsMap.has(doc.id)) {
                        projectsMap.set(doc.id, { ...doc.data() as Project, id: doc.id});
                    }
                });
            }
            setPartnerProjects(Array.from(projectsMap.values()));

        } catch (error) {
            console.error("Error fetching referred clients data:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [user, userLoading, firestore]);


  const combinedReferrals = useMemo((): CombinedReferral[] => {
    const referrals: CombinedReferral[] = [];
    const convertedProjects = partnerProjects.filter(p => ['approved', 'in-progress', 'completed'].includes(p.status || ''));
    const convertedUserIds = new Set(convertedProjects.map(p => p.userId));
    const convertedLeadEmails = new Set(convertedProjects.map(p => p.userId.startsWith('unregistered_') ? p.userId.split('_')[1] : null).filter(Boolean));

    // Add referred users who have NOT converted
    referredUsers.forEach(u => {
        if (!convertedUserIds.has(u.uid)) {
            referrals.push({
                id: u.uid,
                name: u.name,
                email: u.email,
                phone: u.mobile,
                referredAt: u.createdAt.toDate(),
                status: 'Signed Up',
            });
        }
    });

    // Add submitted leads who have NOT converted
    submittedLeads.forEach(l => {
        const isConverted = l.status === 'converted' || convertedLeadEmails.has(l.email);
        if (!isConverted) {
            referrals.push({
                id: l.id!,
                name: l.name,
                email: l.email,
                phone: l.phone,
                referredAt: l.createdAt.toDate(),
                status: 'Submitted Lead',
            });
        }
    });

    return referrals.sort((a,b) => b.referredAt.getTime() - a.referredAt.getTime());

  }, [referredUsers, submittedLeads, partnerProjects]);


  const getStatusVariant = (status: CombinedReferral['status']) => {
      switch(status) {
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
                <CardTitle>Prospective Clients & Leads</CardTitle>
                <CardDescription>This table shows everyone you referred who has not yet converted to a project.</CardDescription>
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
                        <h3 className="text-lg font-semibold">No Pending Referrals</h3>
                        <p className="text-sm">Submit a new lead or wait for existing ones to sign up.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
