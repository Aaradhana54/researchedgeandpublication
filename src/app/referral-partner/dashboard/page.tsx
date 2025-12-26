
'use client';

import { useMemo, useState }from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Copy, Users, CheckCircle, DollarSign, Wallet, Share2, Receipt, Banknote, Paintbrush } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import type { UserProfile, Payout, Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { MarketingKitDialog } from '@/components/referral-partner/marketing-kit-dialog';
import { RequestPayoutDialog } from '@/components/referral-partner/request-payout-dialog';
import { Badge } from '@/components/ui/badge';


const COMMISSION_PER_PROJECT = 50; // Example commission amount

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function ReferralDashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

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

  const payoutsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'payouts'), where('userId', '==', user.uid));
  }, [user, firestore]);

  const { data: payouts, loading: payoutsLoading } = useCollection<Payout>(payoutsQuery);

  const loading = userLoading || referralsLoading || payoutsLoading || projectsLoading;

  const referralLink = useMemo(() => {
    if (typeof window === 'undefined' || !user?.referralCode) return '';
    return `${window.location.origin}/signup?ref=${user.referralCode}`;
  }, [user?.referralCode]);

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Copied to Clipboard',
      description: 'Your referral link has been copied.',
    });
  };
  
  const totalLeads = referredUsers?.length ?? 0;
  const convertedLeads = useMemo(() => {
    if (!projects || !referredUsers) return 0;
    const projectUserIds = new Set(projects.map(p => p.userId));
    return referredUsers.filter(u => projectUserIds.has(u.uid)).length;
  }, [projects, referredUsers]);

  const totalCommissionEarned = (projects?.length ?? 0) * COMMISSION_PER_PROJECT;
  const totalPaidOut = payouts?.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0) ?? 0;
  const pendingCommission = totalCommissionEarned - totalPaidOut;


  if (loading || !user) {
    return (
      <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Welcome, {user.name}!
        </h1>
        <p className="text-lg text-muted-foreground">This is your Referral Partner Dashboard.</p>
      </div>

      <Card className="shadow-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-6 h-6 text-primary" />
            Your Referral Link
          </CardTitle>
          <CardDescription>
            Share this link to bring clients and earn commissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
            <pre className="flex-1 p-3 bg-muted rounded-md overflow-x-auto text-sm text-muted-foreground">{referralLink}</pre>
            <Button onClick={handleCopyLink} className="w-full sm:w-auto" disabled={!referralLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
            </Button>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Leads" value={totalLeads} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Converted Clients" value={convertedLeads} icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Available Commission" value={pendingCommission.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} icon={<Wallet className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Total Earnings" value={totalCommissionEarned.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card id="referred-clients">
            <CardHeader>
                <CardTitle>Referred Clients</CardTitle>
                <CardDescription>A list of clients you have referred.</CardDescription>
            </CardHeader>
            <CardContent>
                {referredUsers && referredUsers.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Date Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {referredUsers.map(client => (
                                <TableRow key={client.uid}>
                                    <TableCell className="font-medium">{client.name}</TableCell>
                                    <TableCell>{client.email}</TableCell>
                                    <TableCell>{client.createdAt ? format(client.createdAt.toDate(), 'PPP') : 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                     <div className="text-center p-8 text-muted-foreground">
                        <Users className="mx-auto w-10 h-10 mb-4" />
                        <h3 className="text-lg font-semibold">No Referrals Yet</h3>
                        <p className="text-sm">Share your link to start earning!</p>
                    </div>
                )}
            </CardContent>
        </Card>

        <div className="space-y-8">
            <Card id="payout-history">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Payout History</CardTitle>
                            <CardDescription>A record of your past commission payouts.</CardDescription>
                        </div>
                        <RequestPayoutDialog currentBalance={pendingCommission}>
                           <Button variant="outline" size="sm" disabled={pendingCommission < 1000}>
                               <Banknote className="mr-2 h-4 w-4" />
                               Request Payout
                           </Button>
                        </RequestPayoutDialog>
                    </div>
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
                        <div className="text-center p-8 text-muted-foreground">
                            <Receipt className="mx-auto w-10 h-10 mb-4" />
                            <h3 className="text-lg font-semibold">No Payouts Yet</h3>
                            <p className="text-sm">Your payout history will appear here once available.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
             <Card id="marketing-kit">
                <CardHeader>
                    <CardTitle>Marketing Kit</CardTitle>
                    <CardDescription>Download logos, creatives, and templates to help you promote our services.</CardDescription>
                </CardHeader>
                <CardContent>
                    <MarketingKitDialog>
                        <Button><Paintbrush className="mr-2"/> Access Materials</Button>
                    </MarketingKitDialog>
                </CardContent>
            </Card>
        </div>
      </div>

    </div>
  );
}
