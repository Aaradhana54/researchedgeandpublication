
'use client';

import { useMemo } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Copy, Users, CheckCircle, DollarSign, Download, Paintbrush, Share2 } from 'lucide-react';
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

export default function ReferralDashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const referredUsersQuery = useMemo(() => {
    if (!user || !firestore) return null;
    // Assuming referral code is the user's UID for simplicity, can be a dedicated field.
    return query(collection(firestore, 'users'), where('referredBy', '==', user.uid));
  }, [user, firestore]);

  const { data: referredUsers, loading: referralsLoading } = useCollection<UserProfile>(referredUsersQuery);

  const loading = userLoading || referralsLoading;

  const referralLink = useMemo(() => {
    if (!user?.referralCode) return '';
    return `${window.location.origin}/signup?ref=${user.referralCode}`;
  }, [user?.referralCode]);

  const handleCopyLink = () => {
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
  const totalCommission = (convertedLeads * 50).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }); // Assuming avg. project value for demo

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
            <Button onClick={handleCopyLink} className="w-full sm:w-auto">
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
            </Button>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Leads" value={totalLeads} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Converted Leads" value={convertedLeads} icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Total Earnings (Est.)" value={totalCommission} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
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
                    <CardTitle>Payout History</CardTitle>
                    <CardDescription>This section is under construction.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button disabled><Download className="mr-2"/> Download Statements</Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Marketing Kit</CardTitle>
                    <CardDescription>This section is under construction.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button disabled><Paintbrush className="mr-2"/> Access Materials</Button>
                </CardContent>
            </Card>
        </div>
      </div>

    </div>
  );
}
