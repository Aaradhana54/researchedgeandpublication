'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  FolderKanban,
  DollarSign,
  ClipboardCheck,
  CreditCard,
  ClipboardList,
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
import { collection, query } from 'firebase/firestore';

import { useCollection } from '@/firebase';
import { firestore } from '@/firebase/client';
import type { UserProfile, Project, BookSale, Payout, Invoice, Task } from '@/lib/types';
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
  const usersQuery = useMemo(() => query(collection(firestore, 'users')), []);
  const projectsQuery = useMemo(() => query(collection(firestore, 'projects')), []);
  const salesQuery = useMemo(() => query(collection(firestore, 'book_sales')), []);
  const payoutsQuery = useMemo(() => query(collection(firestore, 'payouts')), []);
  const invoicesQuery = useMemo(() => query(collection(firestore, 'invoices')), []);
  const tasksQuery = useMemo(() => query(collection(firestore, 'tasks')), []);

  const { data: users, loading: loadingUsers } = useCollection<UserProfile>(usersQuery);
  const { data: projects, loading: loadingProjects } = useCollection<Project>(projectsQuery);
  const { data: sales, loading: loadingSales } = useCollection<BookSale>(salesQuery);
  const { data: payouts, loading: loadingPayouts } = useCollection<Payout>(payoutsQuery);
  const { data: invoices, loading: loadingInvoices } = useCollection<Invoice>(invoicesQuery);
  const { data: tasks, loading: loadingTasks } = useCollection<Task>(tasksQuery);

  const loading =
    loadingUsers ||
    loadingProjects ||
    loadingSales ||
    loadingPayouts ||
    loadingInvoices ||
    loadingTasks;

  const totalUsers = users?.length ?? 0;
  const totalProjects = projects?.length ?? 0;
  const totalSales = sales?.length ?? 0;
  const pendingPayouts = payouts?.filter((p) => p.status === 'pending').length ?? 0;
  const totalInvoices = invoices?.length ?? 0;
  const totalTasks = tasks?.length ?? 0;

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">An overview of your platform's activity.</p>
      </div>

      {loading ? (
        <div className="flex h-64 w-full items-center justify-center">
          <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              title="Total Users"
              value={totalUsers}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              link="/admin/users"
              linkText="Manage Users"
            />
            <StatCard
              title="Total Projects"
              value={totalProjects}
              icon={<FolderKanban className="h-4 w-4 text-muted-foreground" />}
              link="/admin/projects"
              linkText="View Projects"
            />
            <StatCard
              title="Total Sales"
              value={totalSales}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              link="/admin/sales"
              linkText="View Sales"
            />
            <StatCard
              title="Pending Payouts"
              value={pendingPayouts}
              icon={<ClipboardCheck className="h-4 w-4 text-muted-foreground" />}
              link="/admin/payouts"
              linkText="Review Payouts"
            />
            <StatCard
              title="Total Invoices"
              value={totalInvoices}
              icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
              link="/admin/invoices"
              linkText="Manage Invoices"
            />
             <StatCard
              title="Active Tasks"
              value={totalTasks}
              icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />}
              link="/admin/projects" // Assuming tasks are managed under projects
              linkText="View Tasks"
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
