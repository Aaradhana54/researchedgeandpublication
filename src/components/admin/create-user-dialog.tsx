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
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import type { UserRole } from '@/lib/types';
import { createUserAsAdmin } from '@/app/actions';

const roles: UserRole[] = [
  'client',
  'admin',
  'author',
  'referral-partner',
  'writing-team',
  'sales-team',
  'publication-team',
  'accounts-team',
];

export function CreateUserDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    const password = formData.get('password') as string;
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
    }

    try {
        const result = await createUserAsAdmin(formData);
        toast({
            title: 'User Created',
            description: result.message,
        });
        setOpen(false); // Close dialog on success
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
    } finally {
        setLoading(false);
    }
  };

  // Reset state when dialog is closed
  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        setError(null);
        setLoading(false);
    }
    setOpen(isOpen);
  }
    
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Fill in the details to create a new user account.</DialogDescription>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
                 {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>}
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" name="email" required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" name="password" required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select name="role" defaultValue="client">
                        <SelectTrigger id="role">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map(r => (
                                <SelectItem key={r} value={r} className="capitalize">{r.replace('-', ' ')}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" disabled={loading}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={loading}>
                        {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Create User
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
  );
}
