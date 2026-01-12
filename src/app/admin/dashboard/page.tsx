
'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  FolderKanban,
  DollarSign,
  CheckCircle,
  ArrowRight,
  LoaderCircle,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { collection, query, getDocs } from 'firebase/firestore';

import { useCollection, useFirestore, useUser } from '@/firebase';
import type { UserProfile, Project, ContactLead } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { format, subDays } from 'date-fns';

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

const chartConfig = {
  projects: {
    label: 'Projects',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function AdminDashboardPage() {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const [userCount, setUserCount] = useState(0);

  const projectsQuery = useMemo(() => firestore ? query(collection(firestore, 'projects')) : null, [firestore]);
  const contactLeadsQuery = useMemo(() => firestore ? query(collection(firestore, 'contact_leads')) : null, [firestore]);

  const { data: projects, loading: loadingProjects } = useCollection<Project>(projectsQuery);
  const { data: contactLeads, loading: loadingContactLeads } = useCollection<ContactLead>(contactLeadsQuery);

  useEffect(() => {
    if (firestore) {
      getDocs(query(collection(firestore, 'users'))).then(snap => {
        setUserCount(snap.size);
      }).catch(err => {
        console.error("Failed to count users:", err);
      })
    }
  }, [firestore]);


  const loading =
    loadingProjects ||
    loadingContactLeads ||
    userCount === 0;

  const stats = useMemo(() => {
    const totalLeads = (projects?.length ?? 0) + (contactLeads?.length ?? 0);
    const approvedLeads = projects?.filter(p => ['approved', 'in-progress', 'completed'].includes(p.status || '')).length ?? 0;
    const totalSales = projects?.filter(p => ['approved', 'in-progress', 'completed'].includes(p.status || ''))
                                .reduce((sum, p) => sum + (p.dealAmount || 0), 0) ?? 0;

    return { totalLeads, approvedLeads, totalSales };
  }, [projects, contactLeads]);


  const projectChartData = useMemo(() => {
    if (!projects) return [];

    const projectCountsByDay: { [key: string]: number } = {};
    const today = new Date();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const formattedDate = format(date, 'MMM d');
        projectCountsByDay[formattedDate] = 0;
    }

    projects.forEach(project => {
        if (project.createdAt) {
            const projectDate = project.createdAt.toDate();
            // Check if the project was created in the last 7 days
            if (projectDate > subDays(today, 7)) {
                const formattedDate = format(projectDate, 'MMM d');
                if (projectCountsByDay.hasOwnProperty(formattedDate)) {
                    projectCountsByDay[formattedDate]++;
                }
            }
        }
    });

    return Object.keys(projectCountsByDay).map(date => ({
        date,
        projects: projectCountsByDay[date],
    }));
  }, [projects]);


  return (
    <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 dashboard-bg h-full">
      <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 shadow-soft border">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome back, {currentUser?.name}! Here's an overview of your platform's activity.
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 w-full items-center justify-center">
          <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={userCount}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              link="/admin/users"
              linkText="Manage Users"
            />
            <StatCard
              title="Total Leads"
              value={stats.totalLeads}
              icon={<FolderKanban className="h-4 w-4 text-muted-foreground" />}
              link="/admin/leads"
              linkText="View Leads"
            />
             <StatCard
              title="Approved Leads"
              value={stats.approvedLeads}
              icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
              link="/admin/approved-leads"
              linkText="View Approved"
            />
            <StatCard
              title="Total Sales"
              value={stats.totalSales.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              link="/admin/sales"
              linkText="View Sales"
            />
          </div>

          <Card className="shadow-soft hover:shadow-lift transition-all duration-300">
            <CardHeader>
              <CardTitle>Recent Project Activity</CardTitle>
              <CardDescription>New projects created in the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={projectChartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                        dataKey="date"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        />
                        <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                        allowDecimals={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))' }}
                            contentStyle={{ 
                                background: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)'
                            }}
                        />
                        <Legend />
                        <Bar dataKey="projects" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

    