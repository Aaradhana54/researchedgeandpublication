
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
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, XCircle } from 'lucide-react';
import type { Project } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useRouter } from 'next/navigation';


const RejectProjectSchema = z.object({
  rejectionReason: z.string().min(10, 'Please provide a brief reason for rejection (min. 10 characters).'),
});

type RejectProjectForm = z.infer<typeof RejectProjectSchema>;

export function RejectProjectDialog({ children, project, onProjectRejected }: { children: React.ReactNode, project: Project, onProjectRejected: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  const form = useForm<RejectProjectForm>({
    resolver: zodResolver(RejectProjectSchema),
    defaultValues: {
      rejectionReason: '',
    }
  });

  const onSubmit = async (data: RejectProjectForm) => {
    if (!project.id || !firestore) {
        setError('An unexpected error occurred. Missing required context.');
        return;
    }
    setLoading(true);
    setError(null);

    try {
        const projectDocRef = doc(firestore, 'projects', project.id!);
        const updateData = {
            status: 'rejected',
            updatedAt: serverTimestamp(),
            rejectionReason: data.rejectionReason,
        };

        await updateDoc(projectDocRef, updateData);
        
        toast({
            title: 'Project Rejected',
            description: 'The lead has been marked as rejected and removed from your queue.',
        });
        
        onProjectRejected(); // Callback to refresh parent state
        setOpen(false);
        router.push('/sales/assigned-leads');


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
        setError(err.message || 'An unknown error occurred while rejecting the project.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Reject Lead</DialogTitle>
                <DialogDescription>Provide a reason for rejecting the lead "{project.title}".</DialogDescription>
            </DialogHeader>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <FormField
                        control={form.control}
                        name="rejectionReason"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rejection Reason</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="e.g., Client not interested, budget mismatch, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     
                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" disabled={loading}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" variant="destructive" disabled={loading}>
                             {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                             <XCircle className="mr-2 h-4 w-4" />
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
