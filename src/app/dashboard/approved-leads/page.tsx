
'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import type { Project } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, LoaderCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function ApprovedProjectsPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !firestore) {
            if (!userLoading) setLoading(false);
            return;
        }

        const fetchProjects = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(firestore, 'projects'), 
                    where('userId', '==', user.uid),
                    where('status', 'in', ['approved', 'in-progress', 'completed'])
                );
                const querySnapshot = await getDocs(q);
                const userProjects = querySnapshot.docs.map(doc => ({ ...doc.data() as Project, id: doc.id }));
                userProjects.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
                setProjects(userProjects);
            } catch (error: any) {
                console.error("Error fetching projects: ", error);
                toast({
                    variant: 'destructive',
                    title: 'Error Loading Projects',
                    description: error.message || 'Could not fetch your projects due to a permission issue.',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();

    }, [user, firestore, userLoading, toast]);


    const getProjectStatusVariant = (status?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
      switch (status) {
          case 'approved':
              return 'default';
          case 'in-progress':
              return 'secondary';
          case 'completed':
              return 'default';
          case 'rejected':
              return 'destructive';
          case 'pending':
              return 'outline';
          default:
              return 'outline';
      }
    }


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
             <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Approved Leads</h1>
                    <p className="text-muted-foreground">View your projects that are approved or in progress.</p>
                </div>
             </div>

            {loading ? (
                <div className="flex justify-center items-center h-60">
                    <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : projects && projects.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Card key={project.id} className="hover:shadow-md transition-shadow flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start gap-2">
                                     <CardTitle className="flex-1">{project.title}</CardTitle>
                                     <Badge variant={getProjectStatusVariant(project.status)} className="capitalize shrink-0">
                                        {project.status || 'Pending'}
                                    </Badge>
                                </div>
                                <CardDescription>{project.serviceType.replace(/-/g, ' ')}</CardDescription>
                            </CardHeader>
                             <CardContent className="flex-grow flex flex-col">
                                <p className="text-sm text-muted-foreground flex-grow">
                                    {project.topic || 'No topic specified'}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                 <div className="text-center border-2 border-dashed border-border rounded-lg p-12 mt-8">
                    <CheckCircle className="mx-auto w-12 h-12 mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-4">No Approved Projects Found</h3>
                    <p className="text-sm text-muted-foreground">When your submitted projects are approved, they will appear here.</p>
                </div>
            )}
        </div>
    );
}
