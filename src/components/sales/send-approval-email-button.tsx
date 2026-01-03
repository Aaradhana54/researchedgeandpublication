
'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
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
} from '@/components/ui/alert-dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


interface SendApprovalEmailButtonProps {
  project: Project;
  client: UserProfile | { name: string, email: string } | undefined;
  onEmailSent?: () => void;
}

export function SendApprovalEmailButton({ project, client, onEmailSent }: SendApprovalEmailButtonProps) {
  const [loading, setLoading] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [needsManualEmail, setNeedsManualEmail] = useState(false);

  const firestore = useFirestore();
  const { toast } = useToast();

  const getClientEmail = () => {
    if (client?.email) {
      return client.email;
    }
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
    
    const mailCollection = collection(firestore, 'mail');
    const mailDoc = doc(mailCollection);
    
    const batch = writeBatch(firestore);

    batch.set(mailDoc, {
      to: [targetEmail],
      message: {
        subject: `Your Project "${project.title}" has been Approved!`,
        html: emailContent,
      },
    });

    const projectRef = doc(firestore, 'projects', project.id);
    batch.update(projectRef, { approvalEmailSent: true });

    try {
      await batch.commit();
      toast({
        title: 'Email Queued',
        description: `An approval email is being sent to ${targetEmail}.`,
      });
      if (onEmailSent) {
        onEmailSent();
      }
      setNeedsManualEmail(false);
    } catch (error: any) {
        const permissionError = new FirestorePermissionError({
            path: `mail/${mailDoc.id}`,
            operation: 'create',
            requestResourceData: "redacted_for_brevity",
          }, error);
        errorEmitter.emit('permission-error', permissionError);
        
        console.error("Failed to send email:", error);
        toast({
            variant: 'destructive',
            title: 'Send Failed',
            description: error.message || 'Could not queue the email for sending.',
        });
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!clientEmail) {
      setNeedsManualEmail(true);
    } else {
      handleSendEmail();
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
    <>
      <Button variant="ghost" size="sm" onClick={handleClick} disabled={loading}>
        {loading ? (
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Mail className="mr-2 h-4 w-4" />
        )}
        Send Mail
      </Button>

      <AlertDialog open={needsManualEmail} onOpenChange={setNeedsManualEmail}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Client Email Required</AlertDialogTitle>
              <AlertDialogDescription>
                No registered email found for this client. Please enter their email address below to send the approval notification.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="pt-2 space-y-2">
              <Label htmlFor="manual-email">Client Email Address</Label>
              <Input
                id="manual-email"
                type="email"
                placeholder="client@example.com"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSendEmail} disabled={loading || !manualEmail}>
                {loading ? <LoaderCircle className="animate-spin" /> : 'Confirm & Send'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
