
'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export function RequestPayoutDialog({ children, currentBalance }: { children: React.ReactNode, currentBalance: number }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState(currentBalance);
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!firestore || !user) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to request a payout.',
            });
            return;
        }
        setLoading(true);

        try {
            const payoutData = {
                userId: user.uid,
                amount,
                status: 'pending',
                requestDate: serverTimestamp(),
                createdAt: serverTimestamp(),
            };
            await addDoc(collection(firestore, 'payouts'), payoutData);

            toast({
                title: 'Payout Requested',
                description: `Your request for ${amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} has been submitted for review.`,
            });
            setOpen(false);

        } catch (error) {
            console.error('Payout request failed:', error);
            toast({
                variant: 'destructive',
                title: 'Request Failed',
                description: 'Could not submit your payout request. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const onOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setAmount(currentBalance); // Reset amount on open
        }
        setOpen(isOpen);
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Request Payout</DialogTitle>

                    <DialogDescription>
                        Transfer your available commission to your bank account.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <Alert>
                        <AlertTitle>Available Balance</AlertTitle>
                        <AlertDescription className="text-2xl font-bold text-primary">
                            {currentBalance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount to Withdraw</Label>
                        <Input 
                            id="amount" 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(Math.min(Number(e.target.value), currentBalance))}
                            max={currentBalance}
                            min="1000" // Example minimum payout
                            required 
                        />
                         <p className="text-xs text-muted-foreground">Minimum payout amount is ₹1,000.</p>
                    </div>

                     <div className="space-y-2">
                        <Label>Bank Details (for demo)</Label>
                        <div className="p-3 border rounded-md bg-muted text-sm text-muted-foreground">
                            <p><strong>Bank:</strong> State Bank of India</p>
                            <p><strong>Account:</strong> ******1234</p>
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" disabled={loading}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading || amount < 1000 || amount > currentBalance}>
                            {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Request
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
