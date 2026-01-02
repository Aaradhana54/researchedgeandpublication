
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, CheckCircle } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, type Query, type DocumentData } from 'firebase/firestore';
import type { UserProfile, Project } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import Link from 'next/link';

interface ConvertedProject extends Project {
    clientName?: string;
}

export default function ConvertedLeadsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const [convertedProjects, setConvertedProjects] = useState<ConvertedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !firestore || !user) {
      if(!userLoading) setLoading(false);
      return;
    }

    const fetchConvertedLeads = async () => {
        setLoading(true);
        
        try {
            const projectsQueries: Query<DocumentData>[] = [];
            
            // Query for projects from users who signed up with the partner's code
            if(user.referralCode) {
                 const referredUsersQuery = query(collection(firestore, 'users'), where('referredBy', '==', user.referralCode));
                 const referredUsersSnap = await getDocs(referredUsersQuery);
                 const referredUserIds = referredUsersSnap.docs.map(doc => doc.id);
                
                 if (referredUserIds.length > 0) {
                     projectsQueries.push(query(
                        collection(firestore, 'projects'),
                        where('userId', 'in', referredUserIds),
                        where('status', 'in', ['approved', 'in-progress', 'completed'])
                    ));
                 }
            }

            // Query for projects converted from leads submitted directly by the partner
            projectsQueries.push(query(
                collection(firestore, 'projects'),
                where('referredByPartnerId', '==', user.uid),
                where('status', 'in', ['approved', 'in-progress', 'completed'])
            ));
            
            // Execute all queries
            const querySnapshots = await Promise.all(projectsQueries.map(q => getDocs(q)));
            
            const projectsMap = new Map<string, Project>();
            querySnapshots.forEach(snapshot => {
                snapshot.docs.forEach(doc => {
                    if(!projectsMap.has(doc.id)) {
                       projectsMap.set(doc.id, { ...doc.data() as Project, id: doc.id });
                    }
                });
            });

            const allPartnerProjects = Array.from(projectsMap.values());
            const clientUserIds = new Set<string>();
            allPartnerProjects.forEach(p => {
                if(!p.userId.startsWith('unregistered_')) {
                    clientUserIds.add(p.userId);
                }
            });

            const usersMap = new Map<string, UserProfile>();
            if (clientUserIds.size > 0) {
                 const usersQuery = query(collection(firestore, 'users'), where('uid', 'in', Array.from(clientUserIds)));
                 const usersSnap = await getDocs(usersQuery);
                 usersSnap.docs.forEach(doc => {
                     usersMap.set(doc.id, doc.data() as UserProfile);
                 });
            }

            const finalProjects: ConvertedProject[] = allPartnerProjects.map(p => {
                let clientName = `Unregistered Client`;
                 if (usersMap.has(p.userId)) {
                    clientName = usersMap.get(p.userId)!.name;
                }
                return { ...p, clientName };
            });

            finalProjects.sort((a,b) => b.finalizedAt!.toDate().getTime() - a.finalizedAt!.toDate().getTime());
            
            setConvertedProjects(finalProjects);

        } catch (error) {
            console.error("Failed to fetch converted leads:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchConvertedLeads();

  }, [user, userLoading, firestore]);
  

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
        <h1 className="text-3xl font-bold tracking-tight">Converted Leads</h1>
        <p className="text-muted-foreground">A list of your referrals that have been converted into approved projects.</p>
      </div>
       <Card>
            <CardHeader>
                <CardTitle>Your Converted Projects</CardTitle>
                <CardDescription>You earn commission for each of these finalized deals.</CardDescription>
            </CardHeader>
            <CardContent>
                {convertedProjects && convertedProjects.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project Title</TableHead>
                                <TableHead>Client Name</TableHead>
                                <TableHead>Date Finalized</TableHead>
                                <TableHead className="text-right">Deal Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {convertedProjects.map(project => (
                                <TableRow key={project.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/admin/projects/${project.id}`} className="hover:underline text-primary">
                                            {project.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {project.clientName}
                                    </TableCell>
                                    <TableCell>
                                        {project.finalizedAt ? format(project.finalizedAt.toDate(), 'PPP') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {project.dealAmount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) || 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                     <div className="text-center p-12 text-muted-foreground">
                        <CheckCircle className="mx-auto w-10 h-10 mb-4" />
                        <h3 className="text-lg font-semibold">No Converted Leads Yet</h3>
                        <p className="text-sm">When a client you refer starts a project, it will appear here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
