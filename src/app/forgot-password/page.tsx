
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LoaderCircle, KeyRound, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFirebaseErrorMessage } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { sendPasswordReset } from '@/firebase/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await sendPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary p-4">
      <Card className="w-full max-w-md mx-auto shadow-lift relative">
        <Button variant="ghost" size="sm" asChild className="absolute top-4 left-4">
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
        </Button>
        <CardHeader className="text-center pt-16">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert variant="default">
              <AlertTitle>Check Your Email</AlertTitle>
              <AlertDescription>
                A password reset link has been sent to <strong>{email}</strong>. Please check your inbox and follow the instructions.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
