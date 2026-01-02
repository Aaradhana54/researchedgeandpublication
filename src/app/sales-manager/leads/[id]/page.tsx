

'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, notFound, useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp, getFirestore, collection, query, where, addDoc, Timestamp } from 'firebase/firestore';
import { useFirebaseApp, useUser, useCollection } from '@/firebase';
import type { Project, UserProfile, ContactLead, ProjectStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, ArrowLeft, CheckCircle, XCircle, FileText, Download, User as UserIcon, Hourglass, Users, Mail, Phone, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { AssignLeadDialog } from '@/components/sales-manager/assign-lead-dialog';
import { ConvertLeadDialog } from '@/components/sales-manager/convert-lead-dialog';


function DetailItem({ label, value, isBadge = false, badgeVariant, children, icon: Icon }: { label: string; value?: string | number | boolean | null; isBadge?: boolean; badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline', children?: React.ReactNode, icon?: React.ElementType }) {
    if (value === null || typeof value === 'undefined' || value === '') return null;
    
    let displayValue: React.ReactNode = value.toString();

    if (typeof value === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
    }

    if (isBadge) {
        displayValue = <Badge variant={badgeVariant || 'secondary'} className="capitalize">{value.toString().replace(/-/g, ' ')}</Badge>;
    }
    
    return (
        <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
             {Icon && <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />}
            <div className="grid gap-0.5 flex-1">
                <p className="font-semibold text-muted-foreground">{label}</p>
                <div className="">{children || displayValue}</div>
            </div>
        </div>
    );
}

function LeadDetailPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const leadId = params.id as string;
    const leadType = searchParams.get('type') as 'project' | 'contact';
    
    const app = useFirebaseApp();
    const firestore = getFirestore(app);
    const router = useRouter();
    const { user: loggedInUser } = useUser();
    
    const [lead, setLead] = useState<Project | ContactLead | null>(null);
    const [clientUser, setClientUser] = useState<UserProfile | null>(null);
    const [assignedSalesUser, setAssignedSalesUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const salesTeamQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'sales-team'));
    }, [firestore]);

    const { data: salesTeam, loading: loadingSalesTeam } = useCollection<UserProfile>(salesTeamQuery);
    
    const fetchLeadData = async () => {
        if (!firestore || !leadId || !leadType) return;

        setLoading(true);
        setError(null);
        try {
            const collectionName = leadType === 'project' ? 'projects' : 'contact_leads';
            const leadDocRef = doc(firestore, collectionName, leadId);
            const leadSnap = await getDoc(leadDocRef);

            if (!leadSnap.exists()) {
                notFound();
                return;
            }

            const leadData = { ...leadSnap.data(), id: leadSnap.id } as Project | ContactLead;
            setLead(leadData);

            // Fetch related user data
            if (leadType === 'project' && (leadData as Project).userId) {
                const userId = (leadData as Project).userId;
                if (!userId.startsWith('unregistered_')) {
                    const userDocRef = doc(firestore, 'users', userId);
                    const userSnap = await getDoc(userDocRef);
                    if (userSnap.exists()) {
                        setClientUser(userSnap.data() as UserProfile);
                    }
                }
            }
            
            if (leadData.assignedSalesId) {
                 const assignedSalesRef = doc(firestore, 'users', leadData.assignedSalesId);
                 const assignedSalesSnap = await getDoc(assignedSalesRef);
                 if(assignedSalesSnap.exists()) {
                     setAssignedSalesUser(assignedSalesSnap.data() as UserProfile);
                 }
            } else {
                setAssignedSalesUser(null);
            }

        } catch (err: any) {
             if (err.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({
                    path: `${leadType === 'project' ? 'projects' : 'contact_leads'}/${leadId}`,
                    operation: 'get',
                }, err);
                errorEmitter.emit('permission-error', permissionError);
            }
            console.error("Failed to fetch lead details:", err);
            setError("Could not load lead data. You may not have permission to view it.");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchLeadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firestore, leadId, leadType]);


    const handleLeadAssigned = () => {
        fetchLeadData(); // Re-fetch the lead data to show the new assignee
    }
    
    const handleLeadConverted = () => {
        router.push('/sales-manager/leads'); // Navigate away after conversion
    }

    const getLeadStatusVariant = (status?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
      switch (status) {
          case 'approved':
          case 'converted':
              return 'default';
          case 'in-progress':
              return 'secondary';
          case 'completed':
              return 'default';
          case 'rejected':
              return 'destructive';
          case 'pending':
          case 'new':
          case 'contacted':
              return 'outline';
          default:
              return 'outline';
      }
    }

    if (loading || loadingSalesTeam) {
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
                            <Link href="/sales-manager/dashboard">Go to Dashboard</Link>
                         </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!lead) {
        notFound();
    }
    
    const isProject = leadType === 'project';
    const isPending = isProject ? (lead as Project).status === 'pending' : (lead as ContactLead).status === 'new';

    const project = isProject ? (lead as Project) : null;
    const contactLead = !isProject ? (lead as ContactLead) : null;
    const leadTitle = project?.title || contactLead?.name || 'Lead';


    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8 max-w-4xl mx-auto">
                 <Button variant="ghost" asChild className="mb-4 -ml-4">
                    <Link href="/sales-manager/leads">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Leads
                    </Link>
                </Button>
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{leadTitle}</h1>
                        <p className="text-muted-foreground">Detailed view of the lead.</p>
                    </div>
                    {isPending && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {!lead.assignedSalesId && salesTeam && salesTeam.length > 0 && (
                                 <AssignLeadDialog lead={lead} leadType={leadType} salesTeam={salesTeam} onLeadAssigned={handleLeadAssigned}>
                                    <Button variant="outline">
                                        <Users className="mr-2 h-4 w-4" />
                                        Assign Lead
                                    </Button>
                                </AssignLeadDialog>
                            )}
                            {contactLead && (
                                <ConvertLeadDialog contactLead={contactLead} onLeadConverted={handleLeadConverted}>
                                    <Button>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Convert to Project
                                    </Button>
                                </ConvertLeadDialog>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                     {/* Client Details Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Client/Lead Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DetailItem label="Name" value={clientUser?.name || contactLead?.name} icon={UserIcon}/>
                            <DetailItem label="Email" value={clientUser?.email || contactLead?.email} icon={Mail}/>
                            <DetailItem label="Phone" value={project?.mobile || contactLead?.phone} icon={Phone}/>
                            {project && clientUser && <DetailItem label="Joined On" value={clientUser?.createdAt ? format(clientUser.createdAt.toDate(), 'PPP') : 'N/A'} />}
                        </CardContent>
                    </Card>

                    {/* Project/Lead Details Section */}
                    {isProject && project && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DetailItem label="Project Title" value={project.title} icon={Briefcase}/>
                                <DetailItem label="Service Type" value={project.serviceType} isBadge badgeVariant="secondary"/>
                                {project.topic && <DetailItem label="Topic" value={project.topic} />}
                                {project.courseLevel && <DetailItem label="Course Level" value={project.courseLevel} isBadge badgeVariant="outline"/>}
                                {project.referencingStyle && <DetailItem label="Referencing Style" value={project.referencingStyle} />}
                                {project.language && <DetailItem label="Language" value={project.language} />}
                                {project.pageCount && <DetailItem label="Page Count" value={project.pageCount} />}
                                {project.wordCount && <DetailItem label="Word Count" value={project.wordCount} />}
                                {project.deadline && <DetailItem label="Client Deadline" value={project.deadline ? format(project.deadline.toDate(), 'PPP') : 'Not specified'} />}
                            </CardContent>
                        </Card>
                    )}
                     {!isProject && contactLead && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Lead Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DetailItem label="Service of Interest" value={contactLead.serviceType} isBadge badgeVariant="secondary"/>
                                {contactLead.message && <DetailItem label="Message" value={contactLead.message} />}
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
                            <Badge variant={getLeadStatusVariant(lead.status)} className="capitalize text-lg">
                                {lead.status || 'Pending'}
                            </Badge>
                             {assignedSalesUser && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                                     <div className="flex items-center gap-2 mt-1">
                                        <UserIcon className="w-4 h-4 text-muted-foreground"/>
                                        <span className="font-semibold">{assignedSalesUser.name}</span>
                                    </div>
                                </div>
                             )}
                        </CardContent>
                    </Card>

                    {project?.synopsisFileUrl && (
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


export default function LeadDetailPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background"><LoaderCircle className="h-10 w-10 animate-spin text-primary" /></div>}>
            <LeadDetailPageContent />
        </Suspense>
    );
}
