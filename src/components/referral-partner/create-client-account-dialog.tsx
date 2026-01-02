
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
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, UserPlus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { Project } from '@/lib/types';
import { createUserAsAdmin } from '@/firebase/auth';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { useFirebaseApp } from '@/firebase';

const CreateClientSchema = z.object({
  name: z.string().min(1, 'Client name is required.'),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type CreateClientForm = z.infer<typeof CreateClientSchema>;

interface CreateClientAccountDialogProps {
  project: Project;
  onAccountCreated: () => void;
}

export function CreateClientAccountDialog({ project, onAccountCreated }: CreateClientAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const app = useFirebaseApp();
  const firestore = getFirestore(app);

  const clientEmail = project.userId.startsWith('unregistered_') ? project.userId.split('_')[1] : '';

  const form = useForm<CreateClientForm>({
    resolver: zodResolver(CreateClientSchema),
    defaultValues: {
      name: '',
      email: clientEmail,
      password: '',
    },
  });

  const onSubmit = async (data: CreateClientForm) => {
    if (!firestore || !project.id) {
        setError("An unexpected error occurred. Firestore or Project ID is missing.");
        return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1. Create the user in Firebase Auth
      const newUser = await createUserAsAdmin(data.email, data.password, data.name, 'client');
      
      // 2. Update the project document with the new, real user ID
      const projectRef = doc(firestore, 'projects', project.id);
      await updateDoc(projectRef, {
        userId: newUser.uid,
      });

      toast({
        title: 'Client Account Created!',
        description: `An account for ${data.name} has been created and linked to the project.`,
      });

      onAccountCreated(); // Refresh the parent component's data
      setOpen(false); // Close the dialog
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Create Client</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Client Account</DialogTitle>
          <DialogDescription>
            Finalize the client's account for the project "{project.title}". A password reset link will be sent to them.
          </DialogDescription>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter client's full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temporary Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Set a temporary password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={loading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
