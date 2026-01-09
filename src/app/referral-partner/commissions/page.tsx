
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, CheckCircle, DollarSign } from 'lucide-react';
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
  TableFooter
} from '@/components/ui/table';
import { format } from 'date-fns';

interface ConvertedProject extends Project {
    clientName?: string;
}

export default function CommissionsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const [convertedProjects, setConvertedProjects] = useState<ConvertedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConvertedLeads = async () => {
        if (userLoading || !firestore || !user) {
          if(!userLoading) setLoading(false);
          return;
        }
        setLoading(true);
        
        try {
            const projectsMap = new Map<string, Project>();

            // Query for projects converted from leads submitted directly by the partner
            const directLeadsQuery = query(
                collection(firestore, 'projects'),
                where('referredByPartnerId', '==', user.uid),
                where('status', 'in', ['approved', 'in-progress', 'completed'])
            );
            const directLeadsSnap = await getDocs(directLeadsQuery);
            directLeadsSnap.forEach(doc => {
                if(!projectsMap.has(doc.id)) {
                   projectsMap.set(doc.id, { ...doc.data() as Project, id: doc.id });
                }
            });
            
            // Query for projects from users who signed up with the partner's code
            if(user.referralCode) {
                 const referredUsersQuery = query(collection(firestore, 'users'), where('referredBy', '==', user.referralCode));
                 const referredUsersSnap = await getDocs(referredUsersQuery);
                 const referredUserIds = referredUsersSnap.docs.map(doc => doc.id);
                
                 if (referredUserIds.length > 0) {
                     const referredProjectsQuery = query(
                        collection(firestore, 'projects'),
                        where('userId', 'in', referredUserIds),
                        where('status', 'in', ['approved', 'in-progress', 'completed'])
                    );
                    const referredProjectsSnap = await getDocs(referredProjectsQuery);
                    referredProjectsSnap.forEach(doc => {
                        if(!projectsMap.has(doc.id)) {
                           projectsMap.set(doc.id, { ...doc.data() as Project, id: doc.id });
                        }
                    });
                 }
            }
  
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
                if (p.userId.startsWith('unregistered_')) {
                    clientName = p.userId.split('_')[1]; // get email
                } else if (usersMap.has(p.userId)) {
                    clientName = usersMap.get(p.userId)!.name;
                }
                return { ...p, clientName };
            });
  
            finalProjects.sort((a,b) => (b.finalizedAt?.toDate()?.getTime() || 0) - (a.finalizedAt?.toDate()?.getTime() || 0));
            
            setConvertedProjects(finalProjects);
  
        } catch (error) {
            console.error("Failed to fetch converted leads:", error);
        } finally {
            setLoading(false);
        }
    };
  
    fetchConvertedLeads();
  }, [user, userLoading, firestore]);

  const totalCommission = useMemo(() => {
    return convertedProjects.reduce((acc, project) => acc + (project.commissionAmount || 0), 0);
  }, [convertedProjects]);

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
        <h1 className="text-3xl font-bold tracking-tight">Your Commissions</h1>
        <p className="text-muted-foreground">A detailed breakdown of the commission earned from each converted lead.</p>
      </div>
       <Card>
            <CardHeader>
                <CardTitle>Commission Earned</CardTitle>
                <CardDescription>You earn a commission for each of these finalized deals.</CardDescription>
            </CardHeader>
            <CardContent>
                {convertedProjects && convertedProjects.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project Title</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Date Finalized</TableHead>
                                <TableHead className="text-right">Commission Earned</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {convertedProjects.map(project => (
                                <TableRow key={project.id}>
                                    <TableCell className="font-medium">
                                      {project.title}
                                    </TableCell>
                                    <TableCell>
                                        {project.clientName}
                                    </TableCell>
                                    <TableCell>
                                        {project.finalizedAt ? format(project.finalizedAt.toDate(), 'PPP') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-green-600">
                                        {project.commissionAmount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) || 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                         <TableFooter>
                            <TableRow>
                                <TableCell colSpan={3} className="font-bold text-lg">Total Commission Earned</TableCell>
                                <TableCell className="text-right font-bold text-lg text-green-600">
                                    {totalCommission.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                ) : (
                     <div className="text-center p-12 text-muted-foreground">
                        <DollarSign className="mx-auto w-10 h-10 mb-4" />
                        <h3 className="text-lg font-semibold">No Commissions Earned Yet</h3>
                        <p className="text-sm">When a client you refer starts a project, your commission will appear here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
