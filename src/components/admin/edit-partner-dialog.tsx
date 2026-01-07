
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
import { LoaderCircle, Edit } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

const EditPartnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  commissionRate: z.preprocess(
    (val) => Number(String(val)),
    z.number().min(0, "Commission can't be negative.").optional()
  ),
});

type EditPartnerForm = z.infer<typeof EditPartnerSchema>;

interface EditPartnerDialogProps {
  partner: UserProfile;
  onPartnerUpdated: () => void;
  children: React.ReactNode;
}

export function EditPartnerDialog({ partner, onPartnerUpdated, children }: EditPartnerDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const form = useForm<EditPartnerForm>({
    resolver: zodResolver(EditPartnerSchema),
    defaultValues: {
      name: partner.name,
      commissionRate: partner.commissionRate || 0,
    }
  });

  const onSubmit = async (data: EditPartnerForm) => {
    if (!firestore) return;
    setLoading(true);
    setError(null);

    try {
      const partnerDocRef = doc(firestore, 'users', partner.uid);
      await updateDoc(partnerDocRef, {
        name: data.name,
        commissionRate: data.commissionRate,
      });

      toast({
        title: 'Partner Updated',
        description: `${data.name}'s details have been updated.`,
      });
      onPartnerUpdated();
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
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Edit Partner: {partner.name}</DialogTitle>
                <DialogDescription>Update the details for this referral partner.</DialogDescription>
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
                                <FormLabel>Partner Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Partner's name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="commissionRate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Default Commission Amount (INR)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 5000" {...field} />
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
