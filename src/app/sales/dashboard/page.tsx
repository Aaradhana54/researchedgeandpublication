
'use client';

import { useMemo } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Users, UserCheck, FolderKanban, UserCog } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Project, UserProfile, ContactLead } from '@/lib/types';

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

  // Fetch all users who are clients
  const clientsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'client'));
  }, [firestore]);

  // Fetch all projects
  const projectsQuery = useMemo(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'projects'));
  }, [firestore]);

  // Fetch all contact leads (from website and partners)
  const contactLeadsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'contact_leads'));
  }, [firestore]);

  const { data: clients, loading: clientsLoading } = useCollection<UserProfile>(clientsQuery);
  const { data: projects, loading: projectsLoading } = useCollection<Project>(projectsQuery);
  const { data: contactLeads, loading: contactLeadsLoading } = useCollection<ContactLead>(contactLeadsQuery);

  const loading = userLoading || clientsLoading || projectsLoading || contactLeadsLoading;

  const { totalLeads, convertedLeads, pendingLeads, totalProjects } = useMemo(() => {
    if (!clients || !projects || !contactLeads) {
      return { totalLeads: 0, convertedLeads: 0, pendingLeads: 0, totalProjects: 0 };
    }

    // Total leads are registered clients + leads from forms
    const totalLeads = clients.length + contactLeads.length;

    // Converted leads from client signups (they have at least one project)
    const projectUserIds = new Set(projects.map(p => p.userId));
    const convertedClientLeads = clients.filter(c => projectUserIds.has(c.uid)).length;

    // Converted leads from contact forms
    const convertedContactLeads = contactLeads.filter(l => l.status === 'converted').length;
    
    const convertedLeads = convertedClientLeads + convertedContactLeads;
    
    // Pending leads are clients without projects + 'new' status contact leads
    const pendingClientLeads = clients.filter(c => !projectUserIds.has(c.uid)).length;
    const pendingContactLeads = contactLeads.filter(l => l.status === 'new').length;
    const pendingLeads = pendingClientLeads + pendingContactLeads;

    const totalProjects = projects.length;
    
    return { totalLeads, convertedLeads, pendingLeads, totalProjects };

  }, [clients, projects, contactLeads]);

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
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Leads" value={totalLeads} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Converted Leads" value={convertedLeads} icon={<UserCheck className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Total Projects" value={totalProjects} icon={<FolderKanban className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Pending Leads" value={pendingLeads} icon={<UserCog className="h-4 w-4 text-muted-foreground" />} />
      </div>
    </div>
  );
}
