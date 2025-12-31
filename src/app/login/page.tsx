
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoaderCircle, LogIn, ArrowLeft } from 'lucide-react';

import { loginWithRole, resendVerificationEmail } from '@/firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFirebaseErrorMessage } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleResendVerification = async () => {
    setLoading(true);
    try {
        await resendVerificationEmail(email, password);
        toast({
            title: "Verification Email Sent",
            description: "A new verification link has been sent to your email address."
        });
    } catch (err: any) {
        setError(getFirebaseErrorMessage(err.code) || "Failed to resend verification email.");
    } finally {
        setLoading(false);
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setNeedsVerification(false);

    try {
      await loginWithRole(email, password, 'client');
      // The layout will handle redirection if email is verified
      router.push('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/email-not-verified') {
        setNeedsVerification(true);
        setError(err.message);
      } else {
        setError(getFirebaseErrorMessage(err.code) || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary p-4">
      <Card className="w-full max-w-md mx-auto shadow-lift relative">
         <Button variant="ghost" size="sm" asChild className="absolute top-4 left-4">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Link>
         </Button>
        <CardHeader className="text-center pt-16">
          <CardTitle className="text-2xl font-bold">Client Login</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant={needsVerification ? "default" : "destructive"}>
                <AlertTitle>{needsVerification ? "Email Not Verified" : "Login Failed"}</AlertTitle>
                <AlertDescription>
                    {error}
                     {needsVerification && (
                        <Button 
                            variant="link" 
                            className="p-0 h-auto mt-2" 
                            onClick={handleResendVerification}
                            disabled={loading}
                        >
                            Resend verification email
                        </Button>
                    )}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {"Don't have an account?"}{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
