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
import { createUser } from '@/firebase/auth'; // We'll create this function
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import { getFirebaseErrorMessage } from '@/firebase/errors';
import type { UserRole } from '@/lib/types';

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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
    }

    try {
        await createUser(email, password, name, role);
        toast({
            title: 'User Created',
            description: `An account for ${name} has been successfully created.`,
        });
        // Reset form and close dialog
        setName('');
        setEmail('');
        setPassword('');
        setRole('client');
        setOpen(false);
    } catch (err: any) {
        setError(getFirebaseErrorMessage(err.code));
    } finally {
        setLoading(false);
    }
  };
    
  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Fill in the details to create a new user account.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                 {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>}
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
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
