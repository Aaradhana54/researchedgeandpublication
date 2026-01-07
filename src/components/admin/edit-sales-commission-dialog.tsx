
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
import { LoaderCircle } from 'lucide-react';
import type { Project } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

const EditSalesCommissionSchema = z.object({
  salesCommissionAmount: z.preprocess(
    (val) => Number(String(val)),
    z.number().min(0, "Commission can't be negative.")
  ),
});

type EditSalesCommissionForm = z.infer<typeof EditSalesCommissionSchema>;

interface EditSalesCommissionDialogProps {
  project: Project;
  onCommissionUpdated: () => void;
  children: React.ReactNode;
}

export function EditSalesCommissionDialog({ project, onCommissionUpdated, children }: EditSalesCommissionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const form = useForm<EditSalesCommissionForm>({
    resolver: zodResolver(EditSalesCommissionSchema),
    defaultValues: {
      salesCommissionAmount: project.salesCommissionAmount || 0,
    }
  });

  const onSubmit = async (data: EditSalesCommissionForm) => {
    if (!firestore || !project.id) return;
    setLoading(true);
    setError(null);

    try {
      const projectDocRef = doc(firestore, 'projects', project.id);
      await updateDoc(projectDocRef, {
        salesCommissionAmount: data.salesCommissionAmount,
      });

      toast({
        title: 'Commission Updated',
        description: `The sales commission for "${project.title}" has been updated.`,
      });
      onCommissionUpdated();
      setOpen(false);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
      if (isOpen) {
          form.reset({
              salesCommissionAmount: project.salesCommissionAmount || 0
          });
          setError(null);
      }
      setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Edit Sales Commission</DialogTitle>
                <DialogDescription>Set the sales commission amount for the project: <strong>{project.title}</strong>.</DialogDescription>
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
                        name="salesCommissionAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sales Commission Amount (INR)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 2000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" disabled={loading}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                             {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
