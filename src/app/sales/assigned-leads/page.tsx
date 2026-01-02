
'use client';

import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, getDocs, Query, DocumentData } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
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
                <h3 className="text-lg font-semibold">No Assigned Client Leads</h3>
                <p>You have not been assigned any leads from clients yet.</p>
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
                    <Link href={`/sales/projects/${project.id}`} className="hover:underline text-primary">
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
                <h3 className="text-lg font-semibold">No Assigned Partner Leads</h3>
                <p>You have not been assigned any leads from partners yet.</p>
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
                <h3 className="text-lg font-semibold">No Assigned Website Leads</h3>
                <p>You have not been assigned any leads from the website yet.</p>
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

export default function AssignedLeadsPage() {
    const firestore = useFirestore();
    const { user, loading: userLoading } = useUser();

    const [projects, setProjects] = useState<Project[]>([]);
    const [contactLeads, setContactLeads] = useState<ContactLead[]>([]);
    const [usersMap, setUsersMap] = useState<Map<string, UserProfile>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore || !user) {
            if(!userLoading) setLoading(false);
            return;
        };

        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Fetch assigned projects that are pending
                const projectsQuery = query(
                    collection(firestore, 'projects'),
                    where('assignedSalesId', '==', user.uid),
                    where('status', '==', 'pending')
                );
                const projectsSnap = await getDocs(projectsQuery);
                const fetchedProjects = projectsSnap.docs.map(doc => ({...doc.data() as Project, id: doc.id}));
                setProjects(fetchedProjects);

                // Fetch assigned contact leads that are new
                const contactLeadsQuery = query(
                    collection(firestore, 'contact_leads'),
                    where('assignedSalesId', '==', user.uid),
                    where('status', '==', 'new')
                );
                const contactLeadsSnap = await getDocs(contactLeadsQuery);
                const fetchedContactLeads = contactLeadsSnap.docs.map(doc => ({...doc.data() as ContactLead, id: doc.id}));
                setContactLeads(fetchedContactLeads);

                // Gather all unique user IDs needed for client/partner names
                const userIds = new Set<string>();
                fetchedProjects.forEach(p => {
                    if (!p.userId.startsWith('unregistered_')) {
                        userIds.add(p.userId);
                    }
                });
                fetchedContactLeads.forEach(l => {
                    if (l.referredByPartnerId) userIds.add(l.referredByPartnerId);
                });

                // Fetch user profiles if there are any IDs to fetch
                const newUsersMap = new Map<string, UserProfile>();
                if (userIds.size > 0) {
                     const userIdsArray = Array.from(userIds);
                     // Firestore 'in' query supports up to 30 elements
                     for (let i = 0; i < userIdsArray.length; i += 30) {
                        const chunk = userIdsArray.slice(i, i + 30);
                        const usersQuery = query(collection(firestore, 'users'), where('uid', 'in', chunk));
                        const usersSnap = await getDocs(usersQuery);
                        usersSnap.forEach(doc => {
                           newUsersMap.set(doc.id, doc.data() as UserProfile);
                        });
                     }
                }
                setUsersMap(newUsersMap);

            } catch (error) {
                console.error("Error fetching assigned leads data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [firestore, user, userLoading]);

    const { clientLeads, partnerLeads, websiteLeads, allLeadsCount } = useMemo(() => {
        const clientLeads = projects.filter(p => !p.userId.startsWith('unregistered_'));
        const partnerLeads = contactLeads.filter(l => !!l.referredByPartnerId);
        const websiteLeads = contactLeads.filter(l => !l.referredByPartnerId);
        const allLeadsCount = clientLeads.length + partnerLeads.length + websiteLeads.length;
        return { clientLeads, partnerLeads, websiteLeads, allLeadsCount };
    }, [projects, contactLeads]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Assigned Leads</h1>
                <p className="text-muted-foreground">A list of all leads currently assigned to you.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Your Active Leads</CardTitle>
                    <CardDescription>
                        This is a list of all pending leads assigned to you. Approved or rejected leads will be removed from this list.
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
                                <TabsTrigger value="all">All ({allLeadsCount})</TabsTrigger>
                                <TabsTrigger value="clients">Client Leads ({clientLeads.length})</TabsTrigger>
                                <TabsTrigger value="partners">Partner Leads ({partnerLeads.length})</TabsTrigger>
                                <TabsTrigger value="website">Website Leads ({websiteLeads.length})</TabsTrigger>
                            </TabsList>
                            <TabsContent value="all">
                                {allLeadsCount > 0 ? (
                                    <div className="space-y-8">
                                        {clientLeads.length > 0 && <ClientLeadsTable projects={clientLeads} usersMap={usersMap} />}
                                        {partnerLeads.length > 0 && <PartnerLeadsTable leads={partnerLeads} usersMap={usersMap} />}
                                        {websiteLeads.length > 0 && <WebsiteLeadsTable leads={websiteLeads} />}
                                    </div>
                                ) : (
                                    <div className="text-center p-12 text-muted-foreground">
                                        <FolderKanban className="mx-auto w-12 h-12 mb-4" />
                                        <h3 className="text-lg font-semibold">No Assigned Leads</h3>
                                        <p>You have no active leads assigned to you.</p>
                                    </div>
                                )}
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
