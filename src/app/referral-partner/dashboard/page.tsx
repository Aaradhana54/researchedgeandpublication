
'use client';

import { useMemo, useState } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Copy, Users, CheckCircle, DollarSign, Download, Paintbrush, Share2, Wallet, Receipt, Banknote } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
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

// Dummy data for payout history
const dummyPayouts = [
    { id: 'PAY-2024015', date: '2024-05-15', amount: '₹12,500', status: 'paid' },
    { id: 'PAY-2024014', date: '2024-04-15', amount: '₹8,200', status: 'paid' },
    { id: 'PAY-2024013', date: '2024-03-15', amount: '₹15,000', status: 'paid' },
] as const;


export default function ReferralDashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const referredUsersQuery = useMemo(() => {
    if (!user || !firestore || !user.referralCode) return null;
    return query(collection(firestore, 'users'), where('referredBy', '==', user.referralCode));
  }, [user, firestore]);

  const { data: referredUsers, loading: referralsLoading } = useCollection<UserProfile>(referredUsersQuery);

  const loading = userLoading || referralsLoading;

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
  
  // Dummy data for now
  const totalLeads = referredUsers?.length ?? 0;
  const convertedLeads = referredUsers?.filter(u => u.role === 'client' /* and has made a purchase, etc. */).length ?? 0; // This logic would need to be more complex
  const commissionRate = 0.10; // 10%
  const pendingCommission = (convertedLeads * 50); // Assuming avg. project value for demo
  const totalCommission = (12500 + 8200 + 15000 + pendingCommission);

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
        <StatCard title="Converted Leads" value={convertedLeads} icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Pending Commission" value={pendingCommission.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} icon={<Wallet className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Total Earnings" value={totalCommission.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
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
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Payout History</CardTitle>
                            <CardDescription>A record of your past commission payouts.</CardDescription>
                        </div>
                        <RequestPayoutDialog currentBalance={pendingCommission}>
                           <Button variant="outline" size="sm">
                               <Banknote className="mr-2 h-4 w-4" />
                               Request Payout
                           </Button>
                        </RequestPayoutDialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {dummyPayouts.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dummyPayouts.map(payout => (
                                    <TableRow key={payout.id}>
                                        <TableCell className="font-medium">{payout.date}</TableCell>
                                        <TableCell>{payout.amount}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={payout.status === 'paid' ? 'default' : 'secondary'} className="capitalize bg-green-100 text-green-800">
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
             <Card>
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
