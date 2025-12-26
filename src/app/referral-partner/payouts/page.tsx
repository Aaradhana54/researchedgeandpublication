
'use client';

import { useMemo } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Banknote, Receipt } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
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

const COMMISSION_PER_PROJECT = 50; // Example commission amount

export default function PayoutsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const payoutsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'payouts'), where('userId', '==', user.uid));
  }, [user, firestore]);

  const { data: payouts, loading: payoutsLoading } = useCollection<Payout>(payoutsQuery);

  const referredUsersQuery = useMemo(() => {
    if (!user || !firestore || !user.referralCode) return null;
    return query(collection(firestore, 'users'), where('referredBy', '==', user.referralCode));
  }, [user, firestore]);

  const { data: referredUsers, loading: referralsLoading } = useCollection<UserProfile>(referredUsersQuery);

  const referredUserIds = useMemo(() => {
    return referredUsers ? referredUsers.map(u => u.uid) : [];
  }, [referredUsers]);

  const projectsQuery = useMemo(() => {
      if (!firestore || referredUserIds.length === 0) return null;
      return query(collection(firestore, 'projects'), where('userId', 'in', referredUserIds));
  }, [firestore, referredUserIds]);

  const { data: projects, loading: projectsLoading } = useCollection<Project>(projectsQuery);

  const loading = userLoading || payoutsLoading || projectsLoading || referralsLoading;

  const totalCommissionEarned = (projects?.length ?? 0) * COMMISSION_PER_PROJECT;
  const totalPaidOut = payouts?.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0) ?? 0;
  const pendingCommission = totalCommissionEarned - totalPaidOut;


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
        <RequestPayoutDialog currentBalance={pendingCommission}>
            <Button variant="outline" disabled={pendingCommission < 1000}>
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
              {payouts && payouts.length > 0 ? (
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {payouts.map(payout => (
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
