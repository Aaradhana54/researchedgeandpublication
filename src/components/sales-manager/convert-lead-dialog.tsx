

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, LoaderCircle } from 'lucide-react';
import type { ContactLead } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import { doc, serverTimestamp, Timestamp, updateDoc, collection, addDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const ConvertLeadSchema = z.object({
  title: z.string().min(1, "Project title is required."),
  dealAmount: z.preprocess(
    (val) => Number(String(val)),
    z.number().min(0, "Deal amount can't be negative")
  ),
  advanceReceived: z.preprocess(
    (val) => Number(String(val)),
    z.number().min(0, "Advance can't be negative")
  ),
  finalDeadline: z.string().min(1, 'Final deadline is required.'),
  discussionNotes: z.string().optional(),
});

type ConvertLeadForm = z.infer<typeof ConvertLeadSchema>;

export function ConvertLeadDialog({ children, contactLead, onLeadConverted }: { children: React.ReactNode, contactLead: ContactLead | null, onLeadConverted: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<ConvertLeadForm>({
    resolver: zodResolver(ConvertLeadSchema),
    defaultValues: {
      title: '',
      dealAmount: 0,
      advanceReceived: 0,
      finalDeadline: '',
      discussionNotes: contactLead?.message || '',
    }
  });

  const onSubmit = async (data: ConvertLeadForm) => {
    if (!contactLead?.id || !firestore || !user) {
        setError('An unexpected error occurred. Missing required context.');
        return;
    }
    setLoading(true);
    setError(null);

    try {
        // 1. Create a new project document
        const projectsCollection = collection(firestore, 'projects');
        const projectData: any = {
          // Use a special ID format for unregistered users
          userId: `unregistered_${contactLead.email}`,
          title: data.title,
          mobile: contactLead.phone,
          serviceType: contactLead.serviceType,
          status: 'approved',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          dealAmount: data.dealAmount,
          advanceReceived: data.advanceReceived,
          discussionNotes: data.discussionNotes,
          finalDeadline: Timestamp.fromDate(new Date(data.finalDeadline)),
          finalizedAt: serverTimestamp(),
          finalizedBy: user.uid,
          assignedSalesId: contactLead.assignedSalesId,
          referredByPartnerId: contactLead.referredByPartnerId || null, // Add partner ID
        };
        await addDoc(projectsCollection, projectData);
        
        // 2. Update the contact lead status
        const leadDocRef = doc(firestore, 'contact_leads', contactLead.id);
        await updateDoc(leadDocRef, {
            status: 'converted'
        });
        
        toast({
            title: 'Lead Converted!',
            description: 'The lead has been converted to an approved project.',
        });
        
        onLeadConverted();
        setOpen(false);

    } catch (err: any) {
         if (err.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: `projects / contact_leads`,
            operation: 'write',
            requestResourceData: "redacted_for_brevity",
          }, err);
          errorEmitter.emit('permission-error', permissionError);
        }
        console.error(err);
        setError(err.message || 'An unknown error occurred while converting the lead.');
    } finally {
        setLoading(false);
    }
  };

  if (!contactLead) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Convert Lead to Project</DialogTitle>
                <DialogDescription>Create a new project for "{contactLead.name}". This will mark the lead as converted.</DialogDescription>
            </DialogHeader>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto pr-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                     <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="A title for the new project" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="dealAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deal Amount (INR)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g., 50000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="advanceReceived"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Advance Received (INR)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g., 25000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="finalDeadline"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Final Delivery Deadline</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="discussionNotes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Discussion Notes</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Notes from discussion with the client..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     
                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" disabled={loading}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                             {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                             <CheckCircle className="mr-2 h-4 w-4" />
                            Convert & Approve
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
