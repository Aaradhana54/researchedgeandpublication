
'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { ContactLead } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Users } from 'lucide-react';
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

export default function AllLeadsPage() {
  const firestore = useFirestore();

  const leadsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'contact_leads'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: leads, loading: loadingLeads } = useCollection<ContactLead>(leadsQuery);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Form Leads</h1>
        <p className="text-muted-foreground">Leads from partners and the public contact form.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Incoming Leads</CardTitle>
          <CardDescription>
            This is a unified view of all leads from the website and referral partners.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLeads ? (
            <div className="flex justify-center items-center h-48">
              <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : leads && leads.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => {
                  if (!lead.id) return null;
                  const source = lead.referredByPartnerId ? 'Partner' : 'Website';
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
                           <Badge variant={source === 'Partner' ? 'outline' : 'secondary'} className="capitalize">
                            {source}
                           </Badge>
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
                <Users className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Leads Found</h3>
                <p>No new leads have been submitted yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
