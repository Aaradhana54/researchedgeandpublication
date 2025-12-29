
'use client';

import { useMemo } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Users, UserCheck, UserCog } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Project, ContactLead } from '@/lib/types';

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

export default function SalesDashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  // Fetch all projects (client leads)
  const projectsQuery = useMemo(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'projects'));
  }, [firestore]);

  // Fetch all contact leads (from website and partners)
  const contactLeadsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'contact_leads'));
  }, [firestore]);

  const { data: projects, loading: projectsLoading } = useCollection<Project>(projectsQuery);
  const { data: contactLeads, loading: contactLeadsLoading } = useCollection<ContactLead>(contactLeadsQuery);

  const loading = userLoading || projectsLoading || contactLeadsLoading;

  const { totalLeads, convertedLeads, pendingLeads } = useMemo(() => {
    const allProjects = projects || [];
    const allContactLeads = contactLeads || [];

    // Total leads = all client projects + all partner/website leads
    const totalLeads = allProjects.length + allContactLeads.length;

    // Converted leads are projects that are approved/in-progress/completed OR contact_leads that are 'converted'
    const convertedProjectLeads = allProjects.filter(p => ['approved', 'in-progress', 'completed'].includes(p.status || '')).length;
    const convertedContactLeads = allContactLeads.filter(l => l.status === 'converted').length;
    const convertedLeads = convertedProjectLeads + convertedContactLeads;

    // Pending leads are projects with 'pending' status OR contact_leads with 'new' status
    const pendingProjectLeads = allProjects.filter(p => p.status === 'pending').length;
    const pendingContactLeads = allContactLeads.filter(l => l.status === 'new').length;
    const pendingLeads = pendingProjectLeads + pendingContactLeads;
    
    return { totalLeads, convertedLeads, pendingLeads };

  }, [projects, contactLeads]);

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
        <p className="text-lg text-muted-foreground">
          This is your Sales Dashboard Overview.
        </p>
      </div>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Leads" value={totalLeads} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Converted Leads" value={convertedLeads} icon={<UserCheck className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Pending Leads" value={pendingLeads} icon={<UserCog className="h-4 w-4 text-muted-foreground" />} />
      </div>
    </div>
  );
}
