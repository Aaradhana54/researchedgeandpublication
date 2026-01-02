
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Banknote, Receipt } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import type { Payout, Project, UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RequestPayoutDialog } from '@/components/referral-partner/request-payout-dialog';
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

const COMMISSION_PER_PROJECT = 5000;

export default function PayoutsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Get all payouts for the current partner
  const payoutsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'payouts'), where('userId', '==', user.uid));
  }, [user, firestore]);

  const { data: payouts, loading: payoutsLoading } = useCollection<Payout>(payoutsQuery);
  
  // Sort the payouts on the client side
  const sortedPayouts = useMemo(() => {
    if (!payouts) return [];
    return [...payouts].sort((a, b) => b.requestDate.toDate().getTime() - a.requestDate.toDate().getTime());
  }, [payouts]);
  
  useEffect(() => {
      if (!user || !firestore || !user.referralCode) {
          if (!userLoading) setLoadingProjects(false);
          return;
      }
      
      const fetchProjectsForCommission = async () => {
          setLoadingProjects(true);
          try {
              // Get all users referred by the partner
              const referredUsersQuery = query(collection(firestore, 'users'), where('referredBy', '==', user.referralCode));
              const usersSnapshot = await getDocs(referredUsersQuery);
              const userIds = usersSnapshot.docs.map(doc => doc.id);

              if (userIds.length === 0) {
                  setProjects([]);
                  setLoadingProjects(false);
                  return;
              }
              
              // Get all projects for those referred users
              const projectsQuery = query(
                  collection(firestore, 'projects'), 
                  where('userId', 'in', userIds),
                  where('status', 'in', ['approved', 'in-progress', 'completed'])
              );
              const projectsSnapshot = await getDocs(projectsQuery);
              const fetchedProjects = projectsSnapshot.docs.map(doc => doc.data() as Project);
              setProjects(fetchedProjects);

          } catch (e) {
              console.error("Error fetching projects for commission:", e);
          } finally {
              setLoadingProjects(false);
          }
      };

      fetchProjectsForCommission();

  }, [user, firestore, userLoading]);

  const loading = userLoading || payoutsLoading || loadingProjects;

  // Calculate commission based on fetched data
  const availableCommission = useMemo(() => {
    const commissionableProjects = projects?.length ?? 0;
    const totalCommissionEarned = commissionableProjects * COMMISSION_PER_PROJECT;
    const totalPaidOut = payouts?.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0) ?? 0;
    return totalCommissionEarned - totalPaidOut;
  }, [projects, payouts]);


  if (loading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
            <p className="text-muted-foreground">Request and track your commission payouts.</p>
        </div>
        <RequestPayoutDialog currentBalance={availableCommission}>
            <Button variant="outline" disabled={availableCommission < 1000}>
                <Banknote className="mr-2 h-4 w-4" />
                Request Payout
            </Button>
        </RequestPayoutDialog>
      </div>

       <Card>
          <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>A record of your past and pending commission payouts.</CardDescription>
          </CardHeader>
          <CardContent>
              {sortedPayouts && sortedPayouts.length > 0 ? (
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {sortedPayouts.map(payout => (
                              <TableRow key={payout.id}>
                                  <TableCell className="font-medium">{format(payout.requestDate.toDate(), 'PPP')}</TableCell>
                                  <TableCell>{payout.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                                  <TableCell className="text-right">
                                      <Badge 
                                        variant={payout.status === 'paid' ? 'default' : 'secondary'} 
                                        className="capitalize"
                                      >
                                          {payout.status}
                                      </Badge>
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              ) : (
                  <div className="text-center p-12 text-muted-foreground">
                      <Receipt className="mx-auto w-10 h-10 mb-4" />
                      <h3 className="text-lg font-semibold">No Payouts Yet</h3>
                      <p className="text-sm">Your payout history will appear here once available.</p>
                  </div>
              )}
          </CardContent>
      </Card>
    </div>
  );
}
