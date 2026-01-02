
'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Mail, LoaderCircle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Project, UserProfile } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface SendApprovalEmailButtonProps {
  project: Project;
  client: UserProfile | undefined;
}

export function SendApprovalEmailButton({ project, client }: SendApprovalEmailButtonProps) {
  const [loading, setLoading] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [open, setOpen] = useState(false);

  const firestore = useFirestore();
  const { toast } = useToast();

  const getClientEmail = () => {
    if (client?.email) {
      return client.email;
    }
    // Handle unregistered users where userId is like 'unregistered_email@example.com'
    if (project.userId.startsWith('unregistered_')) {
      return project.userId.split('_')[1];
    }
    return '';
  }

  const clientEmail = getClientEmail();

  const handleSendEmail = async () => {
    const targetEmail = clientEmail || manualEmail;

    if (!firestore || !targetEmail || !project.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Client email or project ID is not available.',
      });
      return;
    }

    setLoading(true);

    try {
        const emailContent = `
            <h1>Congratulations! Your Project is Approved!</h1>
            <p>Dear Client,</p>
            <p>We are excited to let you know that your project, <strong>${project.title}</strong>, has been officially approved and finalized by our team.</p>
            <h3>Project Details:</h3>
            <ul>
                <li><strong>Project Title:</strong> ${project.title}</li>
                <li><strong>Service:</strong> ${project.serviceType.replace(/-/g, ' ')}</li>
                <li><strong>Final Deal Amount:</strong> ${project.dealAmount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) || 'N/A'}</li>
                <li><strong>Advance Received:</strong> ${project.advanceReceived?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) || 'N/A'}</li>
                <li><strong>Final Deadline:</strong> ${project.finalDeadline ? new Date(project.finalDeadline.seconds * 1000).toLocaleDateString() : 'N/A'}</li>
            </ul>
            <p>Our writing and research team will begin work shortly. If you haven't created an account yet, you will receive separate instructions to do so. You can monitor the status of your project from your client dashboard.</p>
            <p>Thank you for choosing Research Edge and Publication.</p>
        `;
        
        const batch = writeBatch(firestore);

        // 1. Create the email document
        const mailRef = doc(collection(firestore, 'mail'));
        batch.set(mailRef, {
             to: [targetEmail], // Ensure 'to' is an array
            message: {
                subject: `Your Project "${project.title}" has been Approved!`,
                html: emailContent,
            },
        });

        // 2. Update the project to mark email as sent
        const projectRef = doc(firestore, 'projects', project.id);
        batch.update(projectRef, { approvalEmailSent: true });
        
        await batch.commit();

        toast({
            title: 'Email Queued',
            description: `An approval email is being sent to ${targetEmail}.`,
        });
        setOpen(false);

    } catch (error: any) {
        console.error('Failed to send approval email:', error);
        toast({
            variant: 'destructive',
            title: 'Send Failed',
            description: error.message || 'Could not queue the email for sending.',
        });
    } finally {
        setLoading(false);
    }
  };

  if (project.approvalEmailSent) {
      return (
          <Button variant="ghost" size="sm" disabled>
              <Check className="mr-2 h-4 w-4" />
              Mail Sent
          </Button>
      );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" disabled={loading}>
                <Mail className="mr-2 h-4 w-4" />
                Send Mail
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Confirm Project Approval Email</AlertDialogTitle>
            {clientEmail ? (
                 <AlertDialogDescription>
                    This will send a project approval email to the client at <strong>{clientEmail}</strong>. Are you sure you want to continue?
                </AlertDialogDescription>
            ) : (
                <>
                    <AlertDialogDescription>
                       No registered email found for this client. Please enter their email address below to send the approval notification.
                    </AlertDialogDescription>
                    <div className="pt-4 space-y-2">
                        <Label htmlFor="manual-email">Client Email Address</Label>
                        <Input 
                            id="manual-email"
                            type="email"
                            placeholder="client@example.com"
                            value={manualEmail}
                            onChange={(e) => setManualEmail(e.target.value)}
                        />
                    </div>
                </>
            )}
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendEmail} disabled={loading || (!clientEmail && !manualEmail)}>
                {loading ? <LoaderCircle className="animate-spin" /> : 'Confirm & Send'}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
