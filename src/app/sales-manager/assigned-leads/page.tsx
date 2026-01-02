

'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { Project, UserProfile, ContactLead } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, UserCheck } from 'lucide-react';
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

type CombinedLead = (Project | ContactLead) & {
  leadType: 'Project' | 'Contact';
  clientName: string;
};

export default function AssignedLeadsPage() {
  const firestore = useFirestore();

  const projectsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'projects'), where('assignedSalesId', '!=', null));
  }, [firestore]);

  const contactLeadsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'contact_leads'), where('assignedSalesId', '!=', null));
  }, [firestore]);

  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', 'in', ['client', 'sales-team', 'sales-manager']));
  }, [firestore]);

  const { data: projects, loading: loadingProjects } = useCollection<Project>(projectsQuery);
  const { data: contactLeads, loading: loadingContactLeads } = useCollection<ContactLead>(contactLeadsQuery);
  const { data: users, loading: loadingUsers } = useCollection<UserProfile>(usersQuery);

  const loading = loadingProjects || loadingContactLeads || loadingUsers;

  const usersMap = useMemo(() => {
    if (!users) return new Map<string, UserProfile>();
    return new Map(users.map((user) => [user.uid, user]));
  }, [users]);
  
  const combinedLeads = useMemo(() => {
    const allLeads: CombinedLead[] = [];
    
    projects?.forEach(p => {
      allLeads.push({ 
        ...p, 
        leadType: 'Project',
        clientName: usersMap.get(p.userId)?.name || 'Unknown Client',
      });
    });

    contactLeads?.forEach(l => {
        allLeads.push({
            ...l,
            leadType: 'Contact',
            clientName: l.name,
        });
    });

    // Sort by whichever date is available, createdAt is on both
    return allLeads.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
  }, [projects, contactLeads, usersMap]);


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Assigned Leads</h1>
        <p className="text-muted-foreground">A list of all leads currently assigned to the sales team.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Delegated Leads</CardTitle>
          <CardDescription>
            Track the progress of leads that have been assigned to salespersons.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : combinedLeads && combinedLeads.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client / Project</TableHead>
                  <TableHead>Lead Type</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Date Assigned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combinedLeads.map((lead) => {
                  const assignedToUser = usersMap.get(lead.assignedSalesId!);
                  return (
                    <TableRow key={`${lead.leadType}-${lead.id}`}>
                      <TableCell className="font-medium">
                        <Link href={`/sales-manager/leads/${lead.id}?type=${lead.leadType.toLowerCase()}`} className="hover:underline text-primary">
                          {(lead as Project).title || lead.clientName}
                        </Link>
                         <div className="text-sm text-muted-foreground">{lead.leadType === 'Project' ? lead.clientName : (lead as ContactLead).email}</div>
                      </TableCell>
                       <TableCell>
                           <Badge variant="secondary" className="capitalize">
                            {lead.leadType}
                           </Badge>
                       </TableCell>
                       <TableCell>{assignedToUser?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        {/* Note: This shows creation date as we don't have an "assignedAt" timestamp */}
                        {lead.createdAt ? format(lead.createdAt.toDate(), 'PPP') : 'N/A'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-12 text-muted-foreground">
                <UserCheck className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Leads Assigned</h3>
                <p>No leads have been assigned to the sales team yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
