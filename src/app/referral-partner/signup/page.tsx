'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoaderCircle, UserPlus, ArrowLeft } from 'lucide-react';

import { signup } from '@/firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFirebaseErrorMessage } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ReferralPartnerSignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
    }

    try {
      // Sign up user with the 'referral-partner' role
      await signup(email, password, name, 'referral-partner');
      // Redirect to a future partner dashboard, for now, we can redirect to the home page
      router.push('/'); 
      // You can also show a toast message here
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code));
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
                Back to Home
            </Link>
         </Button>
        <CardHeader className="text-center pt-16">
          <CardTitle className="text-2xl font-bold">Referral Partner Signup</CardTitle>
          <CardDescription>Join our network of referral partners.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Signup Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="partner@example.com"
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
                aria-describedby="password-help"
              />
              <p id="password-help" className="text-xs text-muted-foreground">Password must be at least 6 characters.</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Become a Partner
                </>
              )}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {'Already have an account?'}{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
