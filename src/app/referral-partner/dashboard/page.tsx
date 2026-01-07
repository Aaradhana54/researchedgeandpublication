
'use client';

import { useMemo, useState, useEffect }from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Copy, Users, CheckCircle, DollarSign, Wallet, Share2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, type Query, type DocumentData } from 'firebase/firestore';
import type { UserProfile, Payout, Project, ContactLead } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ReferClientDialog } from '@/components/referral-partner/refer-client-dialog';
import { Input } from '@/components/ui/input';


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
  
  const [referredUsers, setReferredUsers] = useState<UserProfile[]>([]);
  const [submittedLeads, setSubmittedLeads] = useState<ContactLead[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [partnerProjects, setPartnerProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !firestore || !user) {
      if(!userLoading) setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch users referred by code
        const referredUsersQuery = user.referralCode ? query(collection(firestore, 'users'), where('referredBy', '==', user.referralCode)) : null;
        const referredUsersSnap = referredUsersQuery ? await getDocs(referredUsersQuery) : { docs: [] };
        const fetchedReferredUsers = referredUsersSnap.docs.map(doc => doc.data() as UserProfile);
        setReferredUsers(fetchedReferredUsers);
        const referredUserIds = fetchedReferredUsers.map(u => u.uid);
        
        // Fetch leads submitted by partner
        const submittedLeadsQuery = query(collection(firestore, 'contact_leads'), where('referredByPartnerId', '==', user.uid));
        const submittedLeadsSnap = await getDocs(submittedLeadsQuery);
        setSubmittedLeads(submittedLeadsSnap.docs.map(doc => ({...doc.data() as ContactLead, id: doc.id})));

        // Fetch payouts
        const payoutsQuery = query(collection(firestore, 'payouts'), where('userId', '==', user.uid));
        const payoutsSnap = await getDocs(payoutsQuery);
        setPayouts(payoutsSnap.docs.map(doc => ({...doc.data() as Payout, id: doc.id})));

        // Fetch projects relevant to this partner
        const projectsQueries: Query<DocumentData>[] = [];
        if (referredUserIds.length > 0) {
          projectsQueries.push(query(collection(firestore, 'projects'), where('userId', 'in', referredUserIds)));
        }
        projectsQueries.push(query(collection(firestore, 'projects'), where('referredByPartnerId', '==', user.uid)));
        
        const projectSnapshots = await Promise.all(projectsQueries.map(q => getDocs(q)));
        const projectsMap = new Map<string, Project>();
        projectSnapshots.forEach(snapshot => {
          snapshot.docs.forEach(doc => {
            if(!projectsMap.has(doc.id)) {
              projectsMap.set(doc.id, {...doc.data() as Project, id: doc.id});
            }
          });
        });
        setPartnerProjects(Array.from(projectsMap.values()));

      } catch (error) {
        console.error("Error fetching partner dashboard data:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load dashboard data.'});
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, firestore, userLoading, toast]);


  const referralLink = useMemo(() => {
    if (typeof window === 'undefined' || !user?.referralCode) return '';
    return `${window.location.origin}/signup?ref=${user.referralCode}`;
  }, [user?.referralCode]);

  // Calculate statistics based on fetched data
  const stats = useMemo(() => {
    if (!user) return { totalReferred: 0, convertedClients: 0, availableCommission: 0, totalCommissionEarned: 0 };
    
    const totalReferred = (referredUsers?.length ?? 0) + (submittedLeads?.length ?? 0);
    
    const commissionableProjects = partnerProjects.filter(p => ['approved', 'in-progress', 'completed'].includes(p.status || ''));
    
    const convertedClientIds = new Set<string>();
    commissionableProjects.forEach(p => {
        const clientId = p.userId.startsWith('unregistered_') ? p.id : p.userId;
        if(clientId) convertedClientIds.add(clientId);
    });
    const convertedClients = convertedClientIds.size;
    
    const totalCommissionEarned = commissionableProjects.reduce((acc, p) => acc + (p.commissionAmount || 0), 0);

    const totalPaidOut = payouts?.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0) ?? 0;
    
    const availableCommission = totalCommissionEarned - totalPaidOut;

    return {
      totalReferred,
      convertedClients,
      availableCommission,
      totalCommissionEarned,
    };
  }, [user, referredUsers, submittedLeads, partnerProjects, payouts]);

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Copied to Clipboard',
      description: 'Your referral link has been copied.',
    });
  };

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

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-lift">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Share2 className="w-6 h-6 text-primary"/>
                        Refer a Client
                    </CardTitle>
                    <CardDescription>
                       Know someone who needs our services? Fill out their details below to create a lead for our sales team.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ReferClientDialog>
                        <Button size="lg" className="w-full">Refer a Client</Button>
                    </ReferClientDialog>
                </CardContent>
            </Card>
             <Card className="shadow-lift">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Copy className="w-6 h-6 text-primary"/>
                        Your Referral Link
                    </CardTitle>
                    <CardDescription>
                        Share this link with clients to sign up. You'll be credited for their projects automatically.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full items-center space-x-2">
                        <Input value={referralLink} readOnly />
                        <Button onClick={handleCopyLink} variant="secondary">Copy Link</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Referred Clients" value={stats.totalReferred} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Converted Clients" value={stats.convertedClients} icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Available Commission" value={stats.availableCommission.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} icon={<Wallet className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Total Earnings" value={stats.totalCommissionEarned.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
      </div>
    </div>
  );
}

