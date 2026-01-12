
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, CheckCircle } from 'lucide-react';
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
import Link from 'next/link';

export default function ConvertedLeadsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const [convertedProjects, setConvertedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !firestore || !user) {
      if (!userLoading) setLoading(false);
      return;
    }

    const fetchConvertedLeads = async () => {
      setLoading(true);
      try {
        const convertedStatuses = ['approved', 'in-progress', 'completed'];

        // Query for projects directly referred by the partner
        const directReferralQuery = query(
          collection(firestore, 'projects'),
          where('referredByPartnerId', '==', user.uid),
          where('status', 'in', convertedStatuses)
        );

        // Query for users who signed up with the partner's referral code
        const referredUsersQuery = user.referralCode
          ? query(collection(firestore, 'users'), where('referredBy', '==', user.referralCode))
          : null;
        
        const [directReferralSnap, referredUsersSnap] = await Promise.all([
            getDocs(directReferralQuery),
            referredUsersQuery ? getDocs(referredUsersQuery) : Promise.resolve({ docs: [] })
        ]);
        
        const projectsMap = new Map<string, Project>();
        directReferralSnap.forEach(doc => {
            projectsMap.set(doc.id, { ...doc.data() as Project, id: doc.id });
        });
        
        const referredUserIds = referredUsersSnap.docs.map(doc => doc.id);
        
        // If there are users who signed up via code, fetch their converted projects
        if (referredUserIds.length > 0) {
            const indirectReferralQuery = query(
                collection(firestore, 'projects'),
                where('userId', 'in', referredUserIds),
                where('status', 'in', convertedStatuses)
            );
            const indirectReferralSnap = await getDocs(indirectReferralQuery);
            indirectReferralSnap.forEach(doc => {
                if (!projectsMap.has(doc.id)) {
                    projectsMap.set(doc.id, { ...doc.data() as Project, id: doc.id });
                }
            });
        }
        
        const allConvertedProjects = Array.from(projectsMap.values());
        allConvertedProjects.sort((a,b) => (b.finalizedAt?.toDate()?.getTime() || 0) - (a.finalizedAt?.toDate()?.getTime() || 0));

        setConvertedProjects(allConvertedProjects);

      } catch (error) {
        console.error("Error fetching converted leads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConvertedLeads();
  }, [user, userLoading, firestore]);

 const getProjectStatusVariant = (status?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'approved': return 'default';
      case 'in-progress': return 'secondary';
      case 'completed': return 'default';
      default: return 'outline';
    }
  };


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
        <h1 className="text-3xl font-bold tracking-tight">Your Converted Leads</h1>
        <p className="text-muted-foreground">A list of all your referrals that have been converted into projects.</p>
      </div>
       <Card>
            <CardHeader>
                <CardTitle>Converted Projects</CardTitle>
                <CardDescription>This table shows all the successful projects from your referrals.</CardDescription>
            </CardHeader>
            <CardContent>
                {convertedProjects.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project Title</TableHead>
                                <TableHead>Deal Value</TableHead>
                                <TableHead>Your Commission</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date Finalized</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {convertedProjects.map(project => (
                                <TableRow key={project.id}>
                                    <TableCell className="font-medium break-words">{project.title}</TableCell>
                                    <TableCell>{project.dealAmount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) || 'N/A'}</TableCell>
                                    <TableCell className="font-semibold text-primary">{project.commissionAmount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={getProjectStatusVariant(project.status)} className="capitalize">{project.status}</Badge>
                                    </TableCell>
                                    <TableCell>{project.finalizedAt ? format(project.finalizedAt.toDate(), 'PPP') : 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                     <div className="text-center p-12 text-muted-foreground">
                        <CheckCircle className="mx-auto w-10 h-10 mb-4" />
                        <h3 className="text-lg font-semibold">No Converted Leads Yet</h3>
                        <p className="text-sm">When your referrals become active projects, they will appear here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
