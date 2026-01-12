
'use client';

import { useMemo, useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
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
import { useToast } from '@/hooks/use-toast';

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
                <p>No pending projects have been submitted directly by clients yet.</p>
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
                  <TableCell className="font-medium break-words">
                    <Link href={`/admin/projects/${project.id}`} className="hover:underline text-primary">
                      {project.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium break-words">{client?.name || 'Unknown User'}</div>
                    <div className="text-sm text-muted-foreground break-all">{client?.email}</div>
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
                <p>Referral partners have not submitted any new leads yet.</p>
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
                      <TableCell className="font-medium break-words">{lead.name}</TableCell>
                      <TableCell>
                        <div className="font-medium break-all">{lead.email}</div>
                        <div className="text-sm text-muted-foreground">{lead.phone}</div>
                      </TableCell>
                      <TableCell className="break-words">{partner?.name || 'Unknown Partner'}</TableCell>
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
                    <TableCell className="font-medium break-words">{lead.name}</TableCell>
                    <TableCell>
                    <div className="font-medium break-all">{lead.email}</div>
                    <div className="text-sm text-muted-foreground">{lead.phone}</div>
                    </TableCell>
                    <TableCell className="break-words">{lead.serviceType || 'Not specified'}</TableCell>
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
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [contactLeads, setContactLeads] = useState<ContactLead[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, UserProfile>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const projectsQuery = query(collection(firestore, 'projects'), orderBy('createdAt', 'desc'));
        const projectsSnap = await getDocs(projectsQuery);
        const fetchedProjects = projectsSnap.docs.map(doc => ({ ...doc.data() as Project, id: doc.id }));
        setProjects(fetchedProjects);

        const contactLeadsQuery = query(collection(firestore, 'contact_leads'), orderBy('createdAt', 'desc'));
        const contactLeadsSnap = await getDocs(contactLeadsQuery);
        const fetchedContactLeads = contactLeadsSnap.docs.map(doc => ({ ...doc.data() as ContactLead, id: doc.id }));
        setContactLeads(fetchedContactLeads);

        // Gather all unique user IDs to fetch their profiles
        const userIds = new Set<string>();
        fetchedProjects.forEach(p => {
          if (p.userId && !p.userId.startsWith('unregistered_')) {
            userIds.add(p.userId);
          }
        });
        fetchedContactLeads.forEach(l => {
          if (l.referredByPartnerId) {
            userIds.add(l.referredByPartnerId);
          }
        });

        // Fetch user profiles in batches of 30 (Firestore 'in' query limit)
        const newUsersMap = new Map<string, UserProfile>();
        if (userIds.size > 0) {
          const userIdsArray = Array.from(userIds);
          const userFetchPromises = [];
          for (let i = 0; i < userIdsArray.length; i += 30) {
            const chunk = userIdsArray.slice(i, i + 30);
            const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', chunk));
            userFetchPromises.push(getDocs(usersQuery));
          }
          const userSnaps = await Promise.all(userFetchPromises);
          userSnaps.forEach(snap => {
            snap.forEach(doc => {
              newUsersMap.set(doc.id, { ...doc.data() as UserProfile, uid: doc.id });
            });
          });
        }
        setUsersMap(newUsersMap);
      } catch (error: any) {
        console.error("Error fetching leads data:", error);
        toast({
            variant: "destructive",
            title: "Failed to Load Data",
            description: error.message || "An unexpected error occurred while fetching leads."
        })
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [firestore, toast]);


  const clientLeads = useMemo(() => {
    if (!projects) return [];
    return projects.filter(p => p.status === 'pending' && !p.userId.startsWith('unregistered_'));
  }, [projects]);

  const partnerLeads = useMemo(() => {
    if (!contactLeads) return [];
    return contactLeads.filter(l => l.status === 'new' && !!l.referredByPartnerId);
  }, [contactLeads]);

  const websiteLeads = useMemo(() => {
    if (!contactLeads) return [];
    return contactLeads.filter(l => l.status === 'new' && !l.referredByPartnerId);
  }, [contactLeads]);

  const allLeadsCount = clientLeads.length + partnerLeads.length + websiteLeads.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
        <p className="text-muted-foreground">A list of all new and pending leads that require action.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Pending Leads</CardTitle>
          <CardDescription>
            This is a master list of every new lead from clients, partners, and the website. Approved or rejected leads are removed.
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
                    <TabsTrigger value="all">All Pending ({allLeadsCount})</TabsTrigger>
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
                            <h3 className="text-lg font-semibold">No Pending Leads Found</h3>
                            <p>All new leads have been processed.</p>
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
