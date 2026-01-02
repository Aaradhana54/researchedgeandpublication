
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
import { LoaderCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const services = [
  'Thesis & Dissertation Writing',
  'Research Paper Writing',
  'Data Analysis',
  'Book Publishing',
  'Institutional Branding',
  'Other',
];

const ReferClientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  serviceType: z.string().optional(),
  message: z.string().optional(),
});

type ReferClientForm = z.infer<typeof ReferClientSchema>;


export function ReferClientDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: partnerUser } = useUser();
  
  const form = useForm<ReferClientForm>({
    resolver: zodResolver(ReferClientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      serviceType: '',
      message: '',
    }
  });

  const onSubmit = async (data: ReferClientForm) => {
    if (!firestore || !partnerUser) {
        setError('You must be logged in to refer a client.');
        return;
    }
    setLoading(true);
    setError(null);

    try {
      const leadsCollection = collection(firestore, 'contact_leads');
      await addDoc(leadsCollection, {
        ...data,
        referredByPartnerId: partnerUser.uid,
        status: 'new',
        createdAt: serverTimestamp(),
        assignedSalesId: null,
      });

      toast({
        title: 'Lead Submitted!',
        description: `Thank you for referring ${data.name}. Our sales team will be in touch.`,
      });
      form.reset();
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
                <DialogTitle>Refer a New Client</DialogTitle>
                <DialogDescription>Fill in the client's details. Our team will contact them shortly.</DialogDescription>
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
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client Full Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
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
                                    <FormLabel>Client Email *</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="client@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client Phone *</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="9876543210" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="serviceType"
                            render={({ field }) => (
                               <FormItem>
                                    <FormLabel>Service of Interest</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a service" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {services.map(s => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                              </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Any additional details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <DialogFooter className="sticky bottom-0 bg-background py-4 -mx-4 px-4 border-t">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary" disabled={loading}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading}>
                                 {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Lead
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </div>
        </DialogContent>
    </Dialog>
  );
}
