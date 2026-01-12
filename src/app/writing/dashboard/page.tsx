
'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { LoaderCircle, ClipboardList, CheckCircle, ArrowRight } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Task } from '@/lib/types';

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

export default function WritingDashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const tasksQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'tasks'), where('assignedTo', '==', user.uid));
  }, [user, firestore]);
  
  const { data: tasks, loading: loadingTasks } = useCollection<Task>(tasksQuery);
  

  const loading = userLoading || loadingTasks;

  const stats = useMemo(() => {
    if (!tasks) return { activeTasks: 0, completedTasks: 0 };
    const activeTasks = tasks.filter(t => t.status !== 'completed').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    return { activeTasks, completedTasks };
  }, [tasks]);

  if (loading || !user) {
    return (
       <div className="flex h-full w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 dashboard-bg h-full">
      <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 shadow-soft border">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Writer Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome back, {user.name}! Here are your current tasks.
        </p>
      </div>
      
       <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            title="My Tasks"
            value={stats.activeTasks}
            icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />}
            link="/writing/tasks"
            linkText="View Tasks"
          />
          <StatCard
            title="Completed Tasks"
            value={stats.completedTasks}
            icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
            link="/writing/completed-leads"
            linkText="View Completed"
          />
        </div>
    </div>
  );
}

