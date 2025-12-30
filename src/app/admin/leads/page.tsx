
'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
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


function ClientLeadsTable({ projects, usersMap }: { projects: Project[], usersMap: Map<string, UserProfile>}) {
    if (projects.length === 0) {
        return (
            <div className="text-center p-12 text-muted-foreground">
                <FolderKanban className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Client Leads Found</h3>
                <p>No projects have been submitted directly by clients yet.</p>
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


function PartnerLeadsTable({ leads, usersMap }: { leads: ContactLead[], usersMap: Map<string, UserProfile>}) {
     if (leads.length === 0) {
        return (
            <div className="text-center p-12 text-muted-foreground">
                <Users className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Partner Leads Found</h3>
                <p>Referral partners have not submitted any leads yet.</p>
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
                  const partner = usersMap.get(lead.referredByPartnerId!);
                  return (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        <div className="font-medium">{lead.email}</div>
                        <div className="text-sm text-muted-foreground">{lead.phone}</div>
                      </TableCell>
                      <TableCell>{partner?.name || 'Unknown Partner'}</TableCell>
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

function WebsiteLeadsTable({ leads }: { leads: ContactLead[]}) {
     if (leads.length === 0) {
        return (
            <div className="text-center p-12 text-muted-foreground">
                <MessageSquare className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Website Leads Found</h3>
                <p>No one has submitted the contact form yet.</p>
            </div>
        );
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Service of Interest</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
            {leads.map((lead) => (
                <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                    <div className="font-medium">{lead.email}</div>
                    <div className="text-sm text-muted-foreground">{lead.phone}</div>
                    </TableCell>
                    <TableCell>{lead.serviceType || 'Not specified'}</TableCell>
                    <TableCell>
                        <Badge variant={getLeadStatusVariant(lead.status)} className="capitalize">
                        {lead.status}
                        </Badge>
                    </TableCell>
                    <TableCell>
                    {lead.createdAt ? format(lead.createdAt.toDate(), 'PPP') : 'N/A'}
                    </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
    );
}

export default function AllLeadsPage() {
  const firestore = useFirestore();

  const projectsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'projects'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const contactLeadsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'contact_leads'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, [firestore]);

  const { data: projects, loading: loadingProjects } = useCollection<Project>(projectsQuery);
  const { data: contactLeads, loading: loadingContactLeads } = useCollection<ContactLead>(contactLeadsQuery);
  const { data: users, loading: loadingUsers } = useCollection<UserProfile>(usersQuery);

  const loading = loadingProjects || loadingUsers || loadingContactLeads;

  const usersMap = useMemo(() => {
    if (!users) return new Map<string, UserProfile>();
    return new Map(users.map((user) => [user.uid, user]));
  }, [users]);

  const clientLeads = useMemo(() => {
      if(!projects) return [];
      return projects.filter(p => !p.userId.startsWith('unregistered_'));
  }, [projects]);
  
  const partnerLeads = useMemo(() => {
      if(!contactLeads) return [];
      return contactLeads.filter(l => !!l.referredByPartnerId);
  }, [contactLeads]);

  const websiteLeads = useMemo(() => {
      if(!contactLeads) return [];
      return contactLeads.filter(l => !l.referredByPartnerId);
  }, [contactLeads]);
  
  const allLeadsCount = (projects?.length || 0) + (contactLeads?.length || 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
        <p className="text-muted-foreground">A comprehensive list of all projects and leads on the platform.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
          <CardDescription>
            This is a master list of every lead, including those from clients, partners, and the website.
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
                    <TabsTrigger value="all">All Leads ({allLeadsCount})</TabsTrigger>
                    <TabsTrigger value="clients">Client Leads ({clientLeads.length})</TabsTrigger>
                    <TabsTrigger value="partners">Partner Leads ({partnerLeads.length})</TabsTrigger>
                    <TabsTrigger value="website">Website Leads ({websiteLeads.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <ClientLeadsTable projects={clientLeads} usersMap={usersMap} />
                </TabsContent>
                <TabsContent value="clients">
                    <ClientLeadsTable projects={clientLeads} usersMap={usersMap} />
                </TabsContent>
                <TabsContent value="partners">
                    <PartnerLeadsTable leads={partnerLeads} usersMap={usersMap} />
                </TabsContent>
                <TabsContent value="website">
                    <WebsiteLeadsTable leads={websiteLeads} />
                </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
