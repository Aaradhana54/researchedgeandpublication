
'use client';

import { useMemo } from 'react';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { ContactLead } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, MessageSquare } from 'lucide-react';
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

export default function AdminWebsiteLeadsPage() {
  const firestore = useFirestore();

  const leadsQuery = useMemo(() => {
    if (!firestore) return null;
    // Query for leads where referredByPartnerId is null (or does not exist)
    // Sorting is removed to prevent index error and will be handled client-side.
    return query(
        collection(firestore, 'contact_leads'), 
        where('referredByPartnerId', '==', null)
    );
  }, [firestore]);
  

  const { data: leads, loading: loadingLeads } = useCollection<ContactLead>(leadsQuery);

  const sortedLeads = useMemo(() => {
    if (!leads) return [];
    return [...leads].sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
  }, [leads]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Website Leads</h1>
        <p className="text-muted-foreground">A list of all leads submitted from the public contact form.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Website Leads</CardTitle>
          <CardDescription>
            These leads were submitted via the contact form on your website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLeads ? (
            <div className="flex justify-center items-center h-48">
              <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : sortedLeads && sortedLeads.length > 0 ? (
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
                {sortedLeads.map((lead) => {
                  if (!lead.id) return null;
                  return (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.name}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{lead.email}</div>
                        <div className="text-sm text-muted-foreground">{lead.phone}</div>
                      </TableCell>
                       <TableCell>
                         {lead.serviceType || 'Not specified'}
                       </TableCell>
                       <TableCell>
                           <Badge variant={'outline'} className="capitalize">
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
          ) : (
            <div className="text-center p-12 text-muted-foreground">
                <MessageSquare className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Website Leads Found</h3>
                <p>No one has submitted the contact form yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
