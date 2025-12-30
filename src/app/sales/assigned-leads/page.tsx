
'use client';

import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { Project, UserProfile, ContactLead } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, FolderKanban, Users, MessageSquare } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getProjectStatusVariant = (status?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'approved': return 'default';
    case 'in-progress': return 'secondary';
    case 'completed': return 'default';
    case 'rejected': return 'destructive';
    case 'pending': return 'outline';
    default: return 'outline';
  }
};

const getLeadStatusVariant = (status?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch(status) {
        case 'new': return 'outline';
        case 'contacted': return 'secondary';
        case 'converted': return 'default';
        default: return 'outline';
    }
}

function AssignedProjectsTable({ projects, usersMap }: { projects: Project[], usersMap: Map<string, UserProfile>}) {
    if (projects.length === 0) {
        return (
            <div className="text-center p-12 text-muted-foreground">
                <FolderKanban className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Assigned Client Projects</h3>
                <p>No projects have been assigned to you yet.</p>
            </div>
        );
    }
    return (
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
    );
}

function AssignedContactLeadsTable({ leads, usersMap }: { leads: ContactLead[], usersMap: Map<string, UserProfile>}) {
     if (leads.length === 0) {
        return (
            <div className="text-center p-12 text-muted-foreground">
                <Users className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Assigned Partner/Website Leads</h3>
                <p>No leads have been assigned to you from partners or the website.</p>
            </div>
        );
    }
    return (
        <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Referred By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => {
                  const partner = lead.referredByPartnerId ? usersMap.get(lead.referredByPartnerId) : 'Website';
                  const referredBy = typeof partner === 'string' ? partner : partner?.name || 'Unknown Partner';

                  return (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        <div className="font-medium">{lead.email}</div>
                        <div className="text-sm text-muted-foreground">{lead.phone}</div>
                      </TableCell>
                      <TableCell>{referredBy}</TableCell>
                       <TableCell>
                           <Badge variant={getLeadStatusVariant(lead.status)} className="capitalize">
                            {lead.status}
                           </Badge>
                       </TableCell>
                      <TableCell>
                        {lead.createdAt ? format(lead.createdAt.toDate(), 'PPP') : 'N/A'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
    );
}


export default function AssignedLeadsPage() {
  const firestore = useFirestore();
  const { user: salesUser } = useUser();

  const assignedProjectsQuery = useMemo(() => {
    if (!firestore || !salesUser) return null;
    return query(collection(firestore, 'projects'), where('assignedSalesId', '==', salesUser.uid));
  }, [firestore, salesUser]);

  const assignedContactLeadsQuery = useMemo(() => {
    if (!firestore || !salesUser) return null;
    return query(collection(firestore, 'contact_leads'), where('assignedSalesId', '==', salesUser.uid));
  }, [firestore, salesUser]);

  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, [firestore]);

  const { data: projects, loading: loadingProjects } = useCollection<Project>(assignedProjectsQuery);
  const { data: contactLeads, loading: loadingContactLeads } = useCollection<ContactLead>(assignedContactLeadsQuery);
  const { data: users, loading: loadingUsers } = useCollection<UserProfile>(usersQuery);

  const loading = loadingProjects || loadingUsers || loadingContactLeads;

  const usersMap = useMemo(() => {
    if (!users) return new Map<string, UserProfile>();
    return new Map(users.map((user) => [user.uid, user]));
  }, [users]);

  const allAssignedCount = (projects?.length || 0) + (contactLeads?.length || 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Assigned Leads</h1>
        <p className="text-muted-foreground">A list of all leads assigned to you.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Leads</CardTitle>
          <CardDescription>
            These are all the leads currently assigned to you for follow-up and finalization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="all">
                <TabsList>
                    <TabsTrigger value="all">All Assigned ({allAssignedCount})</TabsTrigger>
                    <TabsTrigger value="client-projects">From Clients ({projects?.length || 0})</TabsTrigger>
                    <TabsTrigger value="other-leads">From Partners/Website ({contactLeads?.length || 0})</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <AssignedProjectsTable projects={projects || []} usersMap={usersMap} />
                    <AssignedContactLeadsTable leads={contactLeads || []} usersMap={usersMap} />
                </TabsContent>
                <TabsContent value="client-projects">
                    <AssignedProjectsTable projects={projects || []} usersMap={usersMap} />
                </TabsContent>
                <TabsContent value="other-leads">
                    <AssignedContactLeadsTable leads={contactLeads || []} usersMap={usersMap} />
                </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
