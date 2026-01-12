

'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useFirebaseApp, useUser } from '@/firebase';
import type { Project, UserProfile, ProjectStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, ArrowLeft, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function DetailItem({ label, value, isBadge = false, badgeVariant, children }: { label: string; value?: string | number | boolean | null; isBadge?: boolean; badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline', children?: React.ReactNode }) {
    if (value === null || typeof value === 'undefined' || value === '') return null;
    
    let displayValue: React.ReactNode = value.toString();

    if (typeof value === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
    }

    if (isBadge) {
        displayValue = <Badge variant={badgeVariant || 'secondary'} className="capitalize">{value.toString().replace(/-/g, ' ')}</Badge>;
    }
    
    return (
        <div className="grid grid-cols-3 gap-2 py-3 border-b last:border-b-0">
            <div className="font-semibold text-muted-foreground">{label}</div>
            <div className="col-span-2 break-words">{children || displayValue}</div>
        </div>
    );
}

export default function WriterProjectDetailPage() {
    const params = useParams();
    const projectId = params.id as string;
    const app = useFirebaseApp();
    const firestore = getFirestore(app);
    const router = useRouter();
    
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!firestore || !projectId) return;

        const fetchProjectData = async () => {
            setLoading(true);
            setError(null);
            try {
                const projectDocRef = doc(firestore, 'projects', projectId);
                const projectSnap = await getDoc(projectDocRef);

                if (!projectSnap.exists()) {
                    notFound();
                    return;
                }

                const projectData = { ...projectSnap.data(), id: projectSnap.id } as Project;
                setProject(projectData);

            } catch (err: any) {
                 if (err.code === 'permission-denied') {
                    const permissionError = new FirestorePermissionError({
                        path: `projects/${projectId}`,
                        operation: 'get',
                    }, err);
                    errorEmitter.emit('permission-error', permissionError);
                }
                console.error("Failed to fetch project details:", err);
                setError("Could not load project data. You may not have permission to view it.");
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [firestore, projectId]);

    
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

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    if (error) {
        return (
             <div className="flex h-screen w-full items-center justify-center bg-background p-8">
                <Card className="max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="text-destructive">Loading Failed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                         <Button asChild variant="outline" className="mt-4">
                            <Link href="/writing/tasks">Go to My Tasks</Link>
                         </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!project) {
        notFound();
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8 max-w-4xl mx-auto">
                 <Button variant="ghost" asChild className="mb-4 -ml-4">
                    <Link href="/writing/tasks">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to My Tasks
                    </Link>
                </Button>
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight break-words">{project.title}</h1>
                        <p className="text-muted-foreground">Detailed view of the project submission.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Requirements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DetailItem label="Project Title" value={project.title} />
                            <DetailItem label="Service Type" value={project.serviceType} isBadge badgeVariant="secondary"/>
                            <DetailItem label="Topic" value={project.topic} />
                            <DetailItem label="Course Level" value={project.courseLevel} isBadge badgeVariant="outline"/>
                            <DetailItem label="Referencing Style" value={project.referencingStyle} />
                            <DetailItem label="Language" value={project.language} />
                            <DetailItem label="Page Count" value={project.pageCount} />
                            <DetailItem label="Word Count" value={project.wordCount} />
                             <DetailItem label="Project Contact No." value={project.mobile} />
                            <DetailItem label="Deadline" value={project.deadline ? format(project.deadline.toDate(), 'PPP') : 'Not specified'} />
                            <DetailItem label="Wants to Publish" value={project.wantToPublish} />
                            <DetailItem label="Publish Where" value={project.publishWhere} />
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-1 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant={getProjectStatusVariant(project.status)} className="capitalize text-lg">
                                {project.status || 'Pending'}
                            </Badge>
                        </CardContent>
                    </Card>
                    {project.synopsisFileUrl && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Synopsis Attachment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button asChild variant="outline" className="w-full">
                                    <a href={project.synopsisFileUrl} target="_blank" rel="noopener noreferrer">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Download Synopsis
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
