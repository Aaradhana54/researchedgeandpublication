
'use client';

import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
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
  const { user, loading: userLoading } = useUser();

  const [projects, setProjects] = useState<Project[]>([]);
  const [contactLeads, setContactLeads] = useState<ContactLead[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (userLoading || !firestore) {
      if (!userLoading) setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const projectsQuery = query(
          collection(firestore, 'projects'), 
          where('assignedSalesId', '!=', null)
        );
        const contactLeadsQuery = query(
          collection(firestore, 'contact_leads'), 
          where('assignedSalesId', '!=', null)
        );
        
        const [projectsSnap, contactLeadsSnap] = await Promise.all([
          getDocs(projectsQuery),
          getDocs(contactLeadsQuery)
        ]);

        const fetchedProjects = projectsSnap.docs.map(doc => ({...doc.data() as Project, id: doc.id}));
        const fetchedContactLeads = contactLeadsSnap.docs.map(doc => ({...doc.data() as ContactLead, id: doc.id}));

        setProjects(fetchedProjects);
        setContactLeads(fetchedContactLeads);

        const userIds = new Set<string>();
        fetchedProjects.forEach(p => {
          if (p.userId) userIds.add(p.userId);
          if (p.assignedSalesId) userIds.add(p.assignedSalesId);
        });
        fetchedContactLeads.forEach(l => {
          if (l.assignedSalesId) userIds.add(l.assignedSalesId);
        });
        
        const newUsers: UserProfile[] = [];
        if (userIds.size > 0) {
          const ids = Array.from(userIds);
          const userFetchPromises = [];
          for (let i = 0; i < ids.length; i += 30) {
            const chunk = ids.slice(i, i+30);
            const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', chunk));
            userFetchPromises.push(getDocs(usersQuery));
          }
           const userSnaps = await Promise.all(userFetchPromises);
           userSnaps.forEach(snap => {
                snap.forEach(doc => {
                    newUsers.push({ ...doc.data() as UserProfile, uid: doc.id });
                });
           });
        }
        setUsers(newUsers);

      } catch (err: any) {
        console.error("Error fetching assigned leads:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [firestore, user, userLoading]);

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
        clientName: usersMap.get(p.userId)?.name || (p.userId.startsWith('unregistered_') ? p.userId.split('_')[1] : 'Unknown Client'),
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
