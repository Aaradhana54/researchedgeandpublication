
'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { useFirebaseApp, useUser } from '@/firebase';
import type { Project, UserProfile, ProjectStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, ArrowLeft, CheckCircle, XCircle, FileText, Download, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

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
            <div className="col-span-2">{children || displayValue}</div>
        </div>
    );
}

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params.id as string;
    const app = useFirebaseApp();
    const firestore = getFirestore(app);
    const { toast } = useToast();
    const router = useRouter();
    const { user: loggedInUser } = useUser();
    
    const [project, setProject] = useState<Project | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [finalizerUser, setFinalizerUser] = useState<UserProfile | null>(null);
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

                // Fetch related user data
                if (projectData.userId) {
                    const userDocRef = doc(firestore, 'users', projectData.userId);
                    const userSnap = await getDoc(userDocRef);
                    if (userSnap.exists()) {
                        setUser(userSnap.data() as UserProfile);
                    }
                }

                if (projectData.finalizedBy) {
                    const finalizerDocRef = doc(firestore, 'users', projectData.finalizedBy);
                    const finalizerSnap = await getDoc(finalizerDocRef);
                    if (finalizerSnap.exists()) {
                        setFinalizerUser(finalizerSnap.data() as UserProfile);
                    }
                }

            } catch (err: any) {
                console.error("Failed to fetch project details:", err);
                setError("Could not load project data. You may not have permission to view it.");
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [firestore, projectId]);


    const handleStatusUpdate = async (status: ProjectStatus) => {
        if (!firestore) return;
        try {
            const projectDocRef = doc(firestore, 'projects', projectId);
            await updateDoc(projectDocRef, {
                status: status,
                updatedAt: serverTimestamp(),
            });

            setProject(prev => prev ? { ...prev, status } : null);

            toast({
                title: 'Status Updated',
                description: `Project has been marked as ${status}.`
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: error.message
            });
            console.error("Failed to update project status:", error);
        }
    };
    
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
                            <Link href="/dashboard">Go to Dashboard</Link>
                         </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!project) {
        notFound();
    }
    
    const canShowAdminControls = loggedInUser?.role === 'admin';
    const backLink = loggedInUser?.role === 'admin' ? '/admin/projects' : '/sales/projects';

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8 max-w-4xl mx-auto">
                 <Button variant="ghost" asChild className="mb-4 -ml-4">
                    <Link href={backLink}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Projects
                    </Link>
                </Button>
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                        <p className="text-muted-foreground">Detailed view of the project submission.</p>
                    </div>
                    {canShowAdminControls && project.status === 'pending' && (
                        <div className="flex items-center gap-2">
                             <Button variant="destructive" onClick={() => handleStatusUpdate('rejected')}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Details</CardTitle>
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

                    {project.finalizedAt && (
                        <Card>
                             <CardHeader>
                                <CardTitle>Deal Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DetailItem label="Deal Amount" value={project.dealAmount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} />
                                <DetailItem label="Advance Received" value={project.advanceReceived?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} />
                                <DetailItem label="Final Deadline" value={project.finalDeadline ? format(project.finalDeadline.toDate(), 'PPP') : 'Not set'} />
                                <DetailItem label="Discussion Notes" value={project.discussionNotes} />
                                <DetailItem label="Payment Screenshot">
                                    {project.paymentScreenshotUrl ? (
                                        <a href={project.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
                                            <Download className="mr-2 h-4 w-4" />
                                            View Screenshot
                                        </a>
                                    ) : 'Not uploaded'}
                                </DetailItem>
                                 <DetailItem label="Finalized On" value={project.finalizedAt ? format(project.finalizedAt.toDate(), 'PPP p') : 'N/A'} />
                                <DetailItem label="Finalized By">
                                    <div className="flex items-center gap-2">
                                        <UserIcon className="w-4 h-4 text-muted-foreground"/>
                                        <span>{finalizerUser ? finalizerUser.name : (project.finalizedBy || 'Unknown')}</span>
                                    </div>
                                </DetailItem>
                            </CardContent>
                        </Card>
                    )}
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
                     <Card>
                        <CardHeader>
                            <CardTitle>Client Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!user && !loading ? <p>User not found.</p> :
                                <>
                                    <DetailItem label="Name" value={user?.name} />
                                    <DetailItem label="Email" value={user?.email} />
                                    <DetailItem label="Profile Mobile No." value={user?.mobile} />
                                    <DetailItem label="Joined On" value={user?.createdAt ? format(user.createdAt.toDate(), 'PPP') : 'N/A'} />
                                </>
                            }
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
