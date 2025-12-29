
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
import { LoaderCircle, Upload } from 'lucide-react';
import type { Project } from '@/lib/types';
import { useFirestore, useStorage, useUser } from '@/firebase';
import { doc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Progress } from '../ui/progress';

const FinalizeDealSchema = z.object({
  dealAmount: z.coerce.number().min(1, 'Deal amount is required'),
  advanceReceived: z.coerce.number().min(0, 'Advance amount is required'),
  finalDeadline: z.string().min(1, 'Final deadline is required'),
  discussionNotes: z.string().optional(),
});

type FinalizeDealForm = z.infer<typeof FinalizeDealSchema>;

export function FinalizeDealDialog({ children, project }: { children: React.ReactNode, project: Project }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
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
      discussionNotes: '',
    }
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: FinalizeDealForm) => {
    if (!project.id || !firestore || !storage || !salesUser) {
        setError('An unexpected error occurred. Missing required context.');
        return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      let downloadUrl = '';
      // 1. Upload screenshot if it exists
      if (file) {
        const storageRef = ref(storage, `payment_screenshots/${project.id}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
        });

        await uploadTask;
        downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
      }
      
      // 2. Update Firestore document
      const projectDocRef = doc(firestore, 'projects', project.id);
      await updateDoc(projectDocRef, {
        ...data,
        finalDeadline: Timestamp.fromDate(new Date(data.finalDeadline)),
        paymentScreenshotUrl: downloadUrl,
        status: 'approved',
        finalizedAt: serverTimestamp(),
        finalizedBy: salesUser.uid,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: 'Lead Finalized!',
        description: `Project "${project.title}" has been approved and updated.`,
      });
      form.reset();
      setFile(null);
      setOpen(false);

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
                <DialogTitle>Finalize Deal: {project.title}</DialogTitle>
                <DialogDescription>Confirm the deal details to approve this project.</DialogDescription>
            </DialogHeader>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
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
                        <Label htmlFor="payment-screenshot">Payment Screenshot (Optional)</Label>
                        <Input 
                            id="payment-screenshot"
                            type="file"
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg, image/gif"
                        />
                        {loading && uploadProgress > 0 && <Progress value={uploadProgress} />}
                    </div>

                    <DialogFooter>
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
        </DialogContent>
    </Dialog>
  );
}
