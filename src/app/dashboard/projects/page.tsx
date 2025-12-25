'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { firestore } from '@/firebase/client';
import { useMemo } from 'react';
import type { Project } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FilePlus, LoaderCircle } from 'lucide-react';

export default function MyProjectsPage() {
    const { user } = useUser();

    const projectsQuery = useMemo(() => {
        if (!user) return null;
        return query(collection(firestore, 'projects'), where('userId', '==', user.uid));
    }, [user]);

    const { data: projects, loading } = useCollection<Project>(projectsQuery);

    return (
        <div className="space-y-6">
             <Card className="shadow-soft">
                <CardHeader>
                    <CardTitle>My Projects</CardTitle>
                    <CardDescription>View and manage all your research and publishing projects.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading && (
                        <div className="flex justify-center items-center h-40">
                            <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    )}
                    {!loading && projects && projects.length > 0 && (
                        <div className="space-y-4">
                            {projects.map((project) => (
                                <Card key={project.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <CardTitle>{project.title}</CardTitle>
                                        <CardDescription>{project.serviceType.replace(/-/g, ' ')}</CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    )}
                     {!loading && (!projects || projects.length === 0) && (
                         <div className="text-center border-2 border-dashed border-border rounded-lg p-12">
                            <h3 className="text-lg font-medium text-muted-foreground mb-4">You have no active projects.</h3>
                            <Button asChild>
                                <Link href="/dashboard/projects/new">
                                    <FilePlus className="mr-2" />
                                    Add New Project
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
