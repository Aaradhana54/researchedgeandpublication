
'use client';

import { useMemo }from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Users } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { ContactLead } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function ReferredClientsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const submittedLeadsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, 'contact_leads'), 
        where('referredByPartnerId', '==', user.uid),
        orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);

  const { data: submittedLeads, loading: leadsLoading } = useCollection<ContactLead>(submittedLeadsQuery);
  
  const loading = userLoading || leadsLoading;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Submitted Leads</h1>
        <p className="text-muted-foreground">A list of all leads you have submitted to the sales team.</p>
      </div>
       <Card>
            <CardHeader>
                <CardTitle>All Submitted Leads</CardTitle>
                <CardDescription>This table shows every lead you have submitted.</CardDescription>
            </CardHeader>
            <CardContent>
                {submittedLeads && submittedLeads.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Client Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Date Submitted</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submittedLeads.map(lead => (
                                <TableRow key={lead.id}>
                                    <TableCell className="font-medium">{lead.name}</TableCell>
                                    <TableCell>
                                        <div>{lead.email}</div>
                                        <div className="text-sm text-muted-foreground">{lead.phone}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{lead.serviceType || 'Not specified'}</Badge>
                                    </TableCell>
                                    <TableCell>{lead.createdAt ? format(lead.createdAt.toDate(), 'PPP') : 'N/A'}</TableCell>
                                     <TableCell>
                                         <Badge variant="outline" className="capitalize">{lead.status}</Badge>
                                     </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                     <div className="text-center p-12 text-muted-foreground">
                        <Users className="mx-auto w-10 h-10 mb-4" />
                        <h3 className="text-lg font-semibold">No Leads Submitted Yet</h3>
                        <p className="text-sm">Use the "Refer a Client" button on your dashboard to submit your first lead.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
