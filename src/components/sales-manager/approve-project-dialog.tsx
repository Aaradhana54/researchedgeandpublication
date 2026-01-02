
'use client';

import { useState, ChangeEvent } from 'react';
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
import type { Project } from '@/lib/types';
import { useFirestore, useUser, useStorage } from '@/firebase';
import { doc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Progress } from '../ui/progress';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const ApproveProjectSchema = z.object({
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

type ApproveProjectForm = z.infer<typeof ApproveProjectSchema>;

export function ApproveProjectDialog({ children, project, clientEmail, onProjectApproved }: { children: React.ReactNode, project: Project, clientEmail?: string, onProjectApproved: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();
  const { user } = useUser();

  const form = useForm<ApproveProjectForm>({
    resolver: zodResolver(ApproveProjectSchema),
    defaultValues: {
      dealAmount: 0,
      advanceReceived: 0,
      finalDeadline: '',
      discussionNotes: '',
    }
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };


  const onSubmit = async (data: ApproveProjectForm) => {
    if (!project.id || !firestore || !user) {
        setError('An unexpected error occurred. Missing required context (Project ID or user).');
        return;
    }
    setLoading(true);
    setError(null);

    const processApproval = async (screenshotUrl = '') => {
        try {
            const projectDocRef = doc(firestore, 'projects', project.id!);
            const updateData: any = {
                status: 'approved',
                updatedAt: serverTimestamp(),
                finalizedAt: serverTimestamp(),
                finalizedBy: user.uid,
                dealAmount: data.dealAmount,
                advanceReceived: data.advanceReceived,
                finalDeadline: Timestamp.fromDate(new Date(data.finalDeadline)),
                discussionNotes: data.discussionNotes,
                paymentScreenshotUrl: screenshotUrl,
                approvalEmailSent: false, // Set to false so it can be sent manually
            };
            
            await updateDoc(projectDocRef, updateData);
            
            toast({
                title: 'Project Approved!',
                description: 'The deal has been finalized. You can now send the approval email.',
            });
            
            onProjectApproved(); // Callback to refresh parent state
            setOpen(false);

        } catch (err: any) {
             if (err.code === 'permission-denied') {
              const permissionError = new FirestorePermissionError({
                path: `projects/${project.id}`,
                operation: 'update',
                requestResourceData: "redacted_for_brevity",
              }, err);
              errorEmitter.emit('permission-error', permissionError);
            }
            console.error(err);
            setError(err.message || 'An unknown error occurred while approving the project.');
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    if (file && storage) {
        setUploading(true);
        const storageRef = ref(storage, `project-payments/${project.id}/${Date.now()}-${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
            (error) => {
                console.error("File upload error:", error);
                setError("Failed to upload screenshot. Please try again.");
                setUploading(false);
                setLoading(false);
            },
            async () => {
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                await processApproval(downloadUrl);
            }
        );
    } else {
        await processApproval();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Approve & Finalize Deal</DialogTitle>
                <DialogDescription>Enter the final deal details for "{project.title}". This action will approve the project.</DialogDescription>
            </DialogHeader>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto pr-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

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
                     <div className="space-y-2">
                        <FormLabel htmlFor="payment-screenshot">Payment Screenshot (Optional)</FormLabel>
                        <Input
                          id="payment-screenshot"
                          type="file"
                          onChange={handleFileChange}
                          disabled={loading}
                          accept="image/*,.pdf"
                        />
                         {uploading && <Progress value={uploadProgress} className="w-full mt-2" />}
                         {file && !loading && <p className="text-xs text-muted-foreground">Selected: {file.name}</p>}
                      </div>

                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" disabled={loading}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                             {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                             <CheckCircle className="mr-2 h-4 w-4" />
                            Approve Deal
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
