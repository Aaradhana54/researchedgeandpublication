
'use client';

import { useMemo }from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Copy, Users, CheckCircle, DollarSign, Wallet, Share2 } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { UserProfile, Payout, Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
        <p className="text-lg text-muted-foreground">This is your Referral Partner Dashboard Overview.</p>
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
    </div>
  );
}
