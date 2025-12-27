
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
import { AlertCircle, LoaderCircle } from 'lucide-react';
import type { UserRole } from '@/lib/types';
import { createUserAsAdmin } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

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
  
  // Feature is disabled due to server auth issues.
  const featureDisabled = true;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Fill in the details to create a new user account.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                 {featureDisabled && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Feature Unavailable</AlertTitle>
                        <AlertDescription>
                            User creation is temporarily disabled due to a server configuration issue. This feature requires administrative permissions that the server cannot currently obtain.
                        </AlertDescription>
                    </Alert>
                 )}
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" required disabled={featureDisabled} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" name="email" required disabled={featureDisabled} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" name="password" required disabled={featureDisabled} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select name="role" defaultValue="client" disabled={featureDisabled}>
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
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={featureDisabled}>
                        Create User
                    </Button>
                </DialogFooter>
            </div>
        </DialogContent>
    </Dialog>
  );
}
