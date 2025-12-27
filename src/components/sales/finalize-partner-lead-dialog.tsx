
'use client';

import { useState, type ChangeEvent } from 'react';
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
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import type { ContactLead, ProjectServiceType } from '@/lib/types';
import { useFirestore, useStorage, useUser } from '@/firebase';
import { doc, serverTimestamp, Timestamp, updateDoc, addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Progress } from '../ui/progress';
import { useRouter } from 'next/navigation';

const FinalizeDealSchema = z.object({
  dealAmount: z.coerce.number().min(1, 'Deal amount is required'),
  advanceReceived: z.coerce.number().min(0, 'Advance amount is required'),
  finalDeadline: z.string().min(1, 'Final deadline is required'),
  discussionNotes: z.string().optional(),
});

type FinalizeDealForm = z.infer<typeof FinalizeDealSchema>;

export function FinalizePartnerLeadDialog({ children, lead }: { children: React.ReactNode, lead: ContactLead }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const firestore = useFirestore();
  const storage = useStorage();
  const { user: salesUser } = useUser();

  const form = useForm<FinalizeDealForm>({
    resolver: zodResolver(FinalizeDealSchema),
    defaultValues: {
      dealAmount: 0,
      advanceReceived: 0,
      finalDeadline: '',
      discussionNotes: '',
    }
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: FinalizeDealForm) => {
    if (!lead.id || !firestore || !storage || !salesUser) {
        setError('An unexpected error occurred. Missing required context.');
        return;
    }
    if (!file) {
        setError('Payment screenshot is required.');
        return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // 1. Create a placeholder user for this project
      // In a real app, you'd create a proper user account. For now, we'll use a placeholder.
      const placeholderUserId = `unregistered_${lead.email.replace(/[^a-zA-Z0-9]/g, '_')}`;

      // 2. Create a new Project from the ContactLead
      const projectData = {
          userId: placeholderUserId, // This user doesn't exist in auth, but links the project
          title: `Project for ${lead.name}`,
          mobile: lead.phone,
          serviceType: 'research-paper' as ProjectServiceType, // Default or map from lead.serviceType
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // Now add the deal finalization data
          ...data,
          status: 'approved',
          finalDeadline: Timestamp.fromDate(new Date(data.finalDeadline)),
          finalizedAt: serverTimestamp(),
          finalizedBy: salesUser.uid,
      };

      const projectCollection = collection(firestore, 'projects');
      const projectDocRef = await addDoc(projectCollection, projectData);

      // 3. Upload screenshot to a path related to the new project
      const storageRef = ref(storage, `payment_screenshots/${projectDocRef.id}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
      });

      await uploadTask;
      const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

      // 4. Update the new project with the screenshot URL
      await updateDoc(projectDocRef, {
        paymentScreenshotUrl: downloadUrl,
      });

      // 5. Update the original lead's status to 'converted'
      const leadDocRef = doc(firestore, 'contact_leads', lead.id);
      await updateDoc(leadDocRef, {
        status: 'converted',
      });


      toast({
        title: 'Lead Finalized!',
        description: `Project for ${lead.name} has been created and approved.`,
      });
      form.reset();
      setFile(null);
      setOpen(false);
      router.refresh();

    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Finalize Partner Lead: {lead.name}</DialogTitle>
                <DialogDescription>Create a project and confirm the deal details to approve this lead.</DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto pr-4">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Alert>
                            <AlertTitle>Lead Details</AlertTitle>
                            <AlertDescription>
                                <p><strong>Name:</strong> {lead.name}</p>
                                <p><strong>Email:</strong> {lead.email}</p>
                                <p><strong>Phone:</strong> {lead.phone}</p>
                            </AlertDescription>
                        </Alert>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="dealAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Final Deal Amount (INR)</FormLabel>
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
                                    <FormLabel>Completion Deadline</FormLabel>
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
                                    <FormLabel>Discussion Summary</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Notes on client discussion, requirements, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-2">
                            <Label htmlFor="payment-screenshot">Payment Screenshot *</Label>
                            <Input 
                                id="payment-screenshot"
                                type="file"
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg, image/gif"
                                required
                            />
                            {loading && uploadProgress > 0 && <Progress value={uploadProgress} />}
                        </div>

                        <DialogFooter className="sticky bottom-0 bg-background py-4 -mx-4 px-4 border-t">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary" disabled={loading}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading}>
                                 {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Finalize & Approve
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </div>
        </DialogContent>
    </Dialog>
  );
}
