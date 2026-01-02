

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useFirebaseApp, useUser } from '@/firebase';
import type { ContactLead, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, ArrowLeft, CheckCircle, XCircle, User as UserIcon, Mail, Phone, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { ConvertLeadDialog } from '@/components/sales-manager/convert-lead-dialog';
import { RejectProjectDialog } from '@/components/sales/reject-project-dialog';

function DetailItem({ label, value, icon: Icon }: { label: string; value?: string | number | boolean | null; icon?: React.ElementType }) {
    if (value === null || typeof value === 'undefined' || value === '') return null;
    
    return (
        <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
             {Icon && <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />}
            <div className="grid gap-0.5 flex-1">
                <p className="font-semibold text-muted-foreground">{label}</p>
                <div className="">{value}</div>
            </div>
        </div>
    );
}


function LeadDetailPageContent() {
    const params = useParams();
    const leadId = params.id as string;
    
    const app = useFirebaseApp();
    const firestore = getFirestore(app);
    const router = useRouter();
    
    const [lead, setLead] = useState<ContactLead | null>(null);
    const [partnerUser, setPartnerUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const fetchLeadData = async () => {
        if (!firestore || !leadId) return;

        setLoading(true);
        setError(null);
        try {
            const leadDocRef = doc(firestore, 'contact_leads', leadId);
            const leadSnap = await getDoc(leadDocRef);

            if (!leadSnap.exists()) {
                notFound();
                return;
            }

            const leadData = { ...leadSnap.data(), id: leadSnap.id } as ContactLead;
            setLead(leadData);

            // Fetch referring partner data if it exists
            if (leadData.referredByPartnerId) {
                const partnerDocRef = doc(firestore, 'users', leadData.referredByPartnerId);
                const partnerSnap = await getDoc(partnerDocRef);
                if (partnerSnap.exists()) {
                    setPartnerUser(partnerSnap.data() as UserProfile);
                }
            }
        } catch (err: any) {
             if (err.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({
                    path: `contact_leads/${leadId}`,
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
    }, [firestore, leadId]);
    
    const handleLeadAction = () => {
        router.push('/sales/assigned-leads');
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
                            <Link href="/sales/dashboard">Go to Dashboard</Link>
                         </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!lead) {
        notFound();
    }
    
    const isPending = lead.status === 'new';

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8 max-w-4xl mx-auto">
                 <Button variant="ghost" asChild className="mb-4 -ml-4">
                    <Link href="/sales/assigned-leads">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Leads
                    </Link>
                </Button>
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{lead.name}</h1>
                        <p className="text-muted-foreground">Detailed view of your assigned lead.</p>
                    </div>
                    {isPending && (
                        <div className="flex items-center gap-2">
                             <RejectProjectDialog project={{id: lead.id, title: lead.name} as any} onProjectRejected={handleLeadAction}>
                                <Button variant="destructive">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                </Button>
                             </RejectProjectDialog>
                             <ConvertLeadDialog contactLead={lead} onLeadConverted={handleLeadAction}>
                                <Button>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve Deal
                                </Button>
                            </ConvertLeadDialog>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lead Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DetailItem label="Name" value={lead.name} icon={UserIcon}/>
                            <DetailItem label="Email" value={lead.email} icon={Mail}/>
                            <DetailItem label="Phone" value={lead.phone} icon={Phone}/>
                            <DetailItem label="Service of Interest" value={lead.serviceType}/>
                            <DetailItem label="Message / Notes" value={lead.message} icon={MessageSquare} />
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-1 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Badge variant={lead.status === 'new' ? 'outline' : 'secondary'} className="capitalize text-lg">
                                {lead.status}
                            </Badge>
                        </CardContent>
                    </Card>
                    {partnerUser && (
                         <Card>
                            <CardHeader>
                                <CardTitle>Referred By</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DetailItem label="Partner Name" value={partnerUser.name} />
                                <DetailItem label="Partner Email" value={partnerUser.email} />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SalesLeadDetailPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background"><LoaderCircle className="h-10 w-10 animate-spin text-primary" /></div>}>
            <LeadDetailPageContent />
        </Suspense>
    );
}
