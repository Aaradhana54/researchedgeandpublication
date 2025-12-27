
'use client';

import { useMemo } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Users, UserCheck, FolderKanban, UserCog } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Project, UserProfile } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';


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

const getProjectStatusVariant = (status?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
      switch (status) {
          case 'approved':
              return 'default';
          case 'in-progress':
              return 'secondary';
          case 'completed':
              return 'default';
          case 'rejected':
              return 'destructive';
          case 'pending':
              return 'outline';
          default:
              return 'outline';
      }
  }


export default function SalesDashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const clientsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'client'));
  }, [firestore]);

  const projectsQuery = useMemo(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'projects'));
  }, [firestore]);
  
  const allUsersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, [firestore]);


  const { data: clients, loading: clientsLoading } = useCollection<UserProfile>(clientsQuery);
  const { data: projects, loading: projectsLoading } = useCollection<Project>(projectsQuery);
  const { data: allUsers, loading: allUsersLoading } = useCollection<UserProfile>(allUsersQuery);

  const loading = userLoading || clientsLoading || projectsLoading || allUsersLoading;

  const usersMap = useMemo(() => {
    if (!allUsers) return new Map();
    return new Map(allUsers.map((user) => [user.uid, user]));
  }, [allUsers]);

  const { totalLeads, convertedLeads, pendingLeads, totalProjects } = useMemo(() => {
    if (!clients || !projects) {
      return { totalLeads: 0, convertedLeads: 0, pendingLeads: 0, totalProjects: 0 };
    }

    const projectUserIds = new Set(projects.map(p => p.userId));
    
    const totalLeads = clients.length;
    const convertedLeads = clients.filter(c => projectUserIds.has(c.uid)).length;
    const pendingLeads = totalLeads - convertedLeads;
    const totalProjects = projects.length;
    
    return { totalLeads, convertedLeads, pendingLeads, totalProjects };

  }, [clients, projects]);


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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Client Leads</CardTitle>
                    <CardDescription>A list of all registered clients.</CardDescription>
                </CardHeader>
                <CardContent>
                     {clients && clients.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clients.map(client => (
                                    <TableRow key={client.uid}>
                                        <TableCell className="font-medium">{client.name}</TableCell>
                                        <TableCell>{client.email}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-center">No client leads yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>All Projects</CardTitle>
                    <CardDescription>A list of all projects submitted by clients.</CardDescription>
                </CardHeader>
                <CardContent>
                    {projects && projects.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Project Title</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted On</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projects.map((project) => {
                                if (!project.id) return null;
                                const client = usersMap.get(project.userId);
                                return (
                                    <TableRow key={project.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/admin/projects/${project.id}`} className="hover:underline text-primary">
                                            {project.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{client?.name || 'Unknown User'}</div>
                                        <div className="text-sm text-muted-foreground">{client?.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">
                                            {project.serviceType.replace(/-/g, ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getProjectStatusVariant(project.status)} className="capitalize">
                                            {project.status || 'Pending'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {project.createdAt ? format(project.createdAt.toDate(), 'PPP') : 'N/A'}
                                    </TableCell>
                                    </TableRow>
                                )
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center p-12 text-muted-foreground">
                            <FolderKanban className="mx-auto w-12 h-12 mb-4" />
                            <h3 className="text-lg font-semibold">No Projects Found</h3>
                            <p>Clients have not submitted any projects yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
