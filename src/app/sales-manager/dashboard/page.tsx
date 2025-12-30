
'use client';

import { useMemo }from 'react';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { LoaderCircle, FolderKanban, CheckCircle, Hourglass, DollarSign, ArrowRight } from 'lucide-react';
import { collection, query, where } from 'firebase/firestore';
import type { Project, ContactLead } from '@/lib/types';
import Link from 'next/link';

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
    <Card className="shadow-soft hover:shadow-lift transition-all duration-300">
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


export default function SalesManagerDashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const projectsQuery = useMemo(() => firestore ? query(collection(firestore, 'projects')) : null, [firestore]);
  const contactLeadsQuery = useMemo(() => firestore ? query(collection(firestore, 'contact_leads')) : null, [firestore]);
  
  const { data: projects, loading: loadingProjects } = useCollection<Project>(projectsQuery);
  const { data: contactLeads, loading: loadingContactLeads } = useCollection<ContactLead>(contactLeadsQuery);

  const loading = userLoading || loadingProjects || loadingContactLeads;

  const stats = useMemo(() => {
    const allLeads = (projects?.length || 0) + (contactLeads?.length || 0);
    
    const completedLeads = projects?.filter(p => p.status === 'completed').length || 0;
    
    const pendingProjects = projects?.filter(p => p.status === 'pending').length || 0;
    const newContactLeads = contactLeads?.filter(l => l.status === 'new').length || 0;
    const pendingLeads = pendingProjects + newContactLeads;
    
    const totalSales = projects?.filter(p => ['approved', 'in-progress', 'completed'].includes(p.status || ''))
                                .reduce((acc, p) => acc + (p.dealAmount || 0), 0) || 0;

    return { allLeads, completedLeads, pendingLeads, totalSales };
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
          This is your Sales Manager Dashboard.
        </p>
      </div>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="All Leads"
            value={stats.allLeads}
            icon={<FolderKanban className="h-4 w-4 text-muted-foreground" />}
            link="/sales-manager/leads"
            linkText="View All Leads"
          />
          <StatCard
            title="Completed Projects"
            value={stats.completedLeads}
            icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
            link="/sales-manager/leads"
            linkText="View Leads"
          />
          <StatCard
            title="Pending Leads"
            value={stats.pendingLeads}
            icon={<Hourglass className="h-4 w-4 text-muted-foreground" />}
            link="/sales-manager/leads"
            linkText="View Leads"
          />
          <StatCard
            title="Total Sales Value"
            value={stats.totalSales.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            link="/sales-manager/approved-leads"
            linkText="View Approved"
          />
        </div>
    </div>
  );
}
