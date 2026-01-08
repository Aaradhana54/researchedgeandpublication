
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
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Users } from 'lucide-react';
import type { Project, UserProfile, ContactLead } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const AssignLeadSchema = z.object({
  assignedSalesId: z.string().min(1, "You must select a sales team member."),
});

type AssignLeadForm = z.infer<typeof AssignLeadSchema>;

interface AssignLeadDialogProps {
    children: React.ReactNode;
    lead: Project | ContactLead;
    leadType: 'project' | 'contact';
    salesTeam: UserProfile[];
    onLeadAssigned: () => void;
}

export function AssignLeadDialog({ children, lead, leadType, salesTeam, onLeadAssigned }: AssignLeadDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<AssignLeadForm>({
    resolver: zodResolver(AssignLeadSchema),
    defaultValues: {
        assignedSalesId: '',
    }
  });

  const onSubmit = async (data: AssignLeadForm) => {
    if (!lead.id || !firestore) {
        setError('An unexpected error occurred. Missing required context.');
        return;
    }
    setLoading(true);
    setError(null);

    try {
        const collectionName = leadType === 'project' ? 'projects' : 'contact_leads';
        const leadDocRef = doc(firestore, collectionName, lead.id);
        
        const updateData = {
            assignedSalesId: data.assignedSalesId,
        };

        await updateDoc(leadDocRef, updateData);
        
        toast({
            title: 'Lead Assigned!',
            description: 'The lead has been assigned to the selected sales team member.',
        });
        
        onLeadAssigned();
        setOpen(false);

    } catch (err: any) {
         if (err.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: `${leadType}/${lead.id}`,
            operation: 'update',
            requestResourceData: { assignedSalesId: data.assignedSalesId },
          }, err);
          // THIS IS THE FIX: Re-throw the error to make it visible
          throw permissionError;
        }
        console.error(err);
        setError(err.message || 'An unknown error occurred while assigning the lead.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Assign Lead to Sales Team</DialogTitle>
                <DialogDescription>Delegate this lead to a member of your sales team.</DialogDescription>
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
                        name="assignedSalesId"
                        render={({ field }) => (
                           <FormItem>
                            <FormLabel>Select Salesperson *</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose a team member" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {salesTeam.map(member => (
                                      <SelectItem key={member.uid} value={member.uid}>{member.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                             <Users className="mr-2 h-4 w-4" />
                            Assign Lead
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
