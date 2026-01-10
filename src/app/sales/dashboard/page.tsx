
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { LoaderCircle, FolderKanban, CheckCircle, Hourglass, DollarSign, ArrowRight } from 'lucide-react';
import { collection, query, where } from 'firebase/firestore';
import type { Project, ContactLead } from '@/lib/types';

function StatCard({
  title,
  value,
  icon,
  link,
  linkText,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  link: string;
  linkText: string;
}) {
  return (
    <Card className="shadow-soft hover:shadow-lift transition-all duration-300 bg-background/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
       <CardFooter>
        <Link
          href={link}
          className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
        >
          {linkText} <ArrowRight className="h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}


export default function SalesDashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const assignedProjectsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'projects'), where('assignedSalesId', '==', user.uid));
  }, [user, firestore]);

  const assignedContactsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'contact_leads'), where('assignedSalesId', '==', user.uid));
  }, [user, firestore]);

  const finalizedProjectsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'projects'), where('finalizedBy', '==', user.uid));
  }, [user, firestore]);

  
  const { data: assignedProjects, loading: loadingProjects } = useCollection<Project>(assignedProjectsQuery);
  const { data: assignedContacts, loading: loadingContacts } = useCollection<ContactLead>(assignedContactsQuery);
  const { data: finalizedProjects, loading: loadingFinalized } = useCollection<Project>(finalizedProjectsQuery);

  const loading = userLoading || loadingProjects || loadingContacts || loadingFinalized;

  const stats = useMemo(() => {
    const assignedLeadsCount = (assignedProjects?.length || 0) + (assignedContacts?.length || 0);
    const completedLeadsCount = assignedProjects?.filter(p => p.status === 'completed').length || 0;
    
    const pendingProjectsCount = assignedProjects?.filter(p => p.status === 'pending').length || 0;
    const newContactsCount = assignedContacts?.filter(l => l.status === 'new').length || 0;
    const pendingLeadsCount = pendingProjectsCount + newContactsCount;

    const totalSalesValue = finalizedProjects?.reduce((acc, p) => acc + (p.dealAmount || 0), 0) || 0;

    return { assignedLeadsCount, completedLeadsCount, pendingLeadsCount, totalSalesValue };

  }, [assignedProjects, assignedContacts, finalizedProjects]);

  if (loading || !user) {
    return (
       <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 dashboard-bg">
      <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 shadow-soft border">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Sales Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome back, {user.name}! Here's an overview of your sales activity.
        </p>
      </div>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Your Assigned Leads"
            value={stats.assignedLeadsCount}
            icon={<FolderKanban className="h-4 w-4 text-muted-foreground" />}
            link="/sales/assigned-leads"
            linkText="View Leads"
          />
          <StatCard
            title="Completed Projects"
            value={stats.completedLeadsCount}
            icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
            link="/sales/assigned-leads"
            linkText="View Leads"
          />
          <StatCard
            title="Pending Leads"
            value={stats.pendingLeadsCount}
            icon={<Hourglass className="h-4 w-4 text-muted-foreground" />}
            link="/sales/assigned-leads"
            linkText="View Leads"
          />
          <StatCard
            title="Your Total Sales"
            value={stats.totalSalesValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            link="/sales/approved-leads"
            linkText="View Approved"
          />
        </div>
    </div>
  );
}

    