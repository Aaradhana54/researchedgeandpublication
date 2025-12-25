'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUpAdmin, type AdminSignupState } from '@/firebase/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import { AnimatedWrapper } from '@/components/animated-wrapper';

const initialState: AdminSignupState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending} size="lg">
      {pending ? <LoaderCircle className="animate-spin" /> : 'Create Admin Account'}
    </Button>
  );
}

export default function AdminSignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useActionState(signUpAdmin, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message.startsWith('Success')) {
      toast({
        title: 'Account Created!',
        description: 'Welcome to the team. Redirecting you to the dashboard.',
      });
      // The layout's useEffect will handle the redirection.
    } else if (state.message.startsWith('Error')) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: state.message.substring(7), // Remove "Error: "
      });
    }
  }, [state, toast, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <AnimatedWrapper>
        <Card className="w-full max-w-md shadow-lift">
          <CardHeader className="text-center space-y-4">
             <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Account Creation</CardTitle>
            <CardDescription>
              Create a secure administrator account for Revio Research.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="e.g., Alex Doe" />
                {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name.join(', ')}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="admin@revio.com" />
                {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email.join(', ')}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" />
                {state.errors?.password && <p className="text-sm text-destructive">{state.errors.password.join(', ')}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" />
                {state.errors?.confirmPassword && <p className="text-sm text-destructive">{state.errors.confirmPassword.join(', ')}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="inviteCode">Invite Code</Label>
                <Input id="inviteCode" name="inviteCode" placeholder="Enter your one-time invite code" />
                {state.errors?.inviteCode && <p className="text-sm text-destructive">{state.errors.inviteCode.join(', ')}</p>}
              </div>

              <SubmitButton />
            </form>
          </CardContent>
           <CardFooter className="justify-center">
             <p className="text-xs text-muted-foreground">
                This is a protected area. Only users with a valid invite code can create an account.
             </p>
           </CardFooter>
        </Card>
      </AnimatedWrapper>
    </div>
  );
}
