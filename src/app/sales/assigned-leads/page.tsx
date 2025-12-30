
'use client';

import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
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


export default function AssignedLeadsPage() {
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();

  const projectsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, 'projects'), 
        where('assignedSalesId', '==', user.uid),
        where('status', '==', 'pending')
    );
  }, [firestore, user]);

  const contactLeadsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, 'contact_leads'), 
        where('assignedSalesId', '==', user.uid),
        where('status', '==', 'new')
    );
  }, [firestore, user]);


  const { data: projects, loading: loadingProjects } = useCollection<Project>(projectsQuery);
  const { data: contactLeads, loading: loadingContactLeads } = useCollection<ContactLead>(contactLeadsQuery);
  
  const loading = loadingProjects || loadingContactLeads || userLoading;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Assigned Leads</h1>
        <p className="text-muted-foreground">A list of all new leads assigned to you.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Leads</CardTitle>
          <CardDescription>
            These are new leads from clients, partners, and the website that require your attention.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (projects?.length === 0 && contactLeads?.length === 0) ? (
             <div className="text-center p-12 text-muted-foreground">
                <FolderKanban className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Assigned Leads</h3>
                <p>You have no new leads assigned to you at the moment.</p>
            </div>
          ) : (
             <p className="text-muted-foreground">This section is under construction. Assigned leads will be displayed here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

