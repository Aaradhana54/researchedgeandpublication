
'use client';

import { useMemo } from 'react';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { ContactLead, UserProfile } from '@/lib/types';
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

export default function AdminPartnerLeadsPage() {
  const firestore = useFirestore();

  const leadsQuery = useMemo(() => {
    if (!firestore) return null;
    // Query only for partner leads and order by date
    return query(
        collection(firestore, 'contact_leads'), 
        where('referredByPartnerId', '!=', null),
        orderBy('createdAt', 'desc')
    );
  }, [firestore]);
  
  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, [firestore]);

  const { data: leads, loading: loadingLeads } = useCollection<ContactLead>(leadsQuery);
  const { data: users, loading: loadingUsers } = useCollection<UserProfile>(usersQuery);

  const loading = loadingLeads || loadingUsers;

  const usersMap = useMemo(() => {
    if (!users) return new Map();
    return new Map(users.map((user) => [user.uid, user]));
  }, [users]);


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Partner Leads</h1>
        <p className="text-muted-foreground">A list of all leads submitted by referral partners.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Referred Leads</CardTitle>
          <CardDescription>
            These leads were submitted by your referral partners.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : leads && leads.length > 0 ? (
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
                  if (!lead.id) return null;
                  const partner = usersMap.get(lead.referredByPartnerId);
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
                         {partner?.name || 'Unknown Partner'}
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
                <h3 className="text-lg font-semibold">No Partner Leads Found</h3>
                <p>Referral partners have not submitted any leads yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
