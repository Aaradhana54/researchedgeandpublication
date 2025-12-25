'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login, googleSignIn } from '@/firebase/auth';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import { getFirebaseErrorMessage } from '@/firebase/errors';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/config';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const userCredential = await login(data.email, data.password);
      const user = userCredential.user;

      // Check for admin role
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().role === 'admin') {
        toast({
          title: 'Login Successful',
          description: 'Welcome back, Admin!',
        });
        router.push('/admin');
      } else {
        // This is a security measure. Even if login is successful,
        // if they don't have the admin role, we don't let them in.
        await user.signOut();
        throw new Error('Access Denied: Not an administrator.');
      }
    } catch (error: any) {
      console.error("Admin Login Error:", error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message.includes('Access Denied') 
          ? error.message 
          : getFirebaseErrorMessage(error.code),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
       <AnimatedWrapper>
        <Card className="w-full max-w-md shadow-lift">
          <CardHeader className="text-center space-y-4">
             <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Administrator Login</CardTitle>
            <CardDescription>
              Access the Revio Research Dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="admin@revio.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                  {isLoading && (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign In
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </AnimatedWrapper>
    </div>
  );
}
