
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoaderCircle, MailCheck } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { logout, resendVerificationEmail } from '@/firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getFirebaseErrorMessage } from '@/firebase/errors';

export default function VerifyEmailPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState(''); // Temp state to re-authenticate for resend

  useEffect(() => {
    if (!userLoading && user?.emailVerified) {
      router.replace('/dashboard');
    }
  }, [user, userLoading, router]);
  
  const handleResend = async () => {
      if(!user) return;
      
      setResending(true);
      setError(null);
      
      // A password is required to re-authenticate the user before sending the email.
      // In a real app, you'd prompt the user for their password securely.
      // For this demo, we'll show an input field if the password is not already stored.
      // This is not a recommended production pattern, but illustrates the requirement.
      if (!password) {
          setError("Password is required to re-send verification email.");
          setResending(false);
          return;
      }
      
      try {
          await resendVerificationEmail(user.email, password);
          toast({
              title: "Email Sent!",
              description: "A new verification link has been sent. Please check your inbox."
          });
      } catch(e: any) {
          setError(getFirebaseErrorMessage(e.code) || "An unexpected error occurred.");
      } finally {
          setResending(false);
          setPassword('');
      }
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (userLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary p-4">
      <Card className="w-full max-w-md mx-auto shadow-lift text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <MailCheck className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold pt-4">Almost there! Verify your email</CardTitle>
          <CardDescription>
            A verification link has been sent to <strong>{user.email}</strong>. Please check your inbox (and spam folder) to complete your registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <p className="text-sm text-muted-foreground">
             Once you've verified your email, this page will automatically redirect you to the dashboard.
           </p>
           
           {error && <p className="text-sm text-destructive">{error}</p>}

           {/* This is a simplified UI for re-authentication. Not for production. */}
           {!user.emailVerified && (
               <div className="space-y-2">
                    <Input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password to resend"
                        className="text-center"
                    />
                   <Button onClick={handleResend} disabled={resending} variant="link" className="text-primary">
                     {resending ? <LoaderCircle className="animate-spin" /> : 'Resend Verification Email'}
                   </Button>
               </div>
           )}

        </CardContent>
        <CardFooter className="flex flex-col gap-2">
            <Button variant="outline" onClick={handleLogout} className="w-full">
                Log Out
            </Button>
            <p className="text-xs text-muted-foreground pt-2">Wrong email? Please sign out and create a new account.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
