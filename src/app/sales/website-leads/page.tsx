
'use client';

import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
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
import { Button } from '@/components/ui/button';
import { FinalizePartnerLeadDialog } from '@/components/sales/finalize-partner-lead-dialog';

export default function SalesWebsiteLeadsPage() {
  const firestore = useFirestore();

  const leadsQuery = useMemo(() => {
    if (!firestore) return null;
    // Query for all unassigned website leads
    // Website leads are identified by referredByPartnerId being null
    // Removing orderBy to prevent composite index requirement. Sorting will be done on client.
    return query(
        collection(firestore, 'contact_leads'), 
        where('referredByPartnerId', '==', null),
        where('assignedSalesId', '==', null)
    );
  }, [firestore]);
  

  const { data, loading: loadingLeads } = useCollection<ContactLead>(leadsQuery);

  const websiteLeads = useMemo(() => {
      if (!data) return [];
      return [...data].sort((a,b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
  }, [data]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Unassigned Website Leads</h1>
        <p className="text-muted-foreground">A pool of all new leads from the public contact form.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Unassigned Website Leads</CardTitle>
          <CardDescription>
            These leads were submitted via the contact form and are waiting to be finalized.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLeads ? (
            <div className="flex justify-center items-center h-48">
              <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : websiteLeads && websiteLeads.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Service of Interest</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {websiteLeads.map((lead) => {
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
                          <Badge variant={lead.status === 'converted' ? 'default' : 'outline'} className="capitalize">
                            {lead.status}
                           </Badge>
                       </TableCell>
                      <TableCell>
                        {lead.createdAt ? format(lead.createdAt.toDate(), 'PPP') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                         {lead.status === 'new' && (
                            <FinalizePartnerLeadDialog lead={lead}>
                                <Button size="sm">Finalize</Button>
                            </FinalizePartnerLeadDialog>
                         )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-12 text-muted-foreground">
                <MessageSquare className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Unassigned Website Leads</h3>
                <p>There are no new website leads at this time.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
