'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { submitContactForm, type ContactFormState } from '@/app/actions';

import { AnimatedWrapper } from '@/components/animated-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useFormStatus } from 'react-dom';
import { LoaderCircle } from 'lucide-react';


const initialState: ContactFormState = {
  message: '',
};

const services = [
  'Thesis & Dissertation Writing',
  'Research Paper Writing',
  'Data Analysis',
  'Book Publishing',
  'Institutional Branding',
  'Other',
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
       {pending ? <LoaderCircle className="animate-spin" /> : 'Send Message'}
    </Button>
  );
}

export function Contact() {
  const [state, formAction] = useActionState(submitContactForm, initialState);
  const [serviceValue, setServiceValue] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message.startsWith('Success')) {
      toast({
        title: 'Message Sent!',
        description: 'Thank you for contacting us. We will get back to you shortly.',
      });
      formRef.current?.reset();
      setServiceValue(undefined);
    } else if (state.message.startsWith('Error')) {
      toast({
        title: 'Submission Error',
        description: state.errors ? 'Please correct the errors and try again.' : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <section id="contact" className="w-full bg-secondary py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
        <AnimatedWrapper>
          <Card className="max-w-2xl mx-auto shadow-lift">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">Contact Us</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Have a question or want to start a project? Fill out the form below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form ref={formRef} action={formAction} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" placeholder="John Doe" required />
                  {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name}</p>}
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required />
                    {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" required />
                     {state.errors?.phone && <p className="text-sm text-destructive">{state.errors.phone}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service of Interest</Label>
                  <Select name="serviceType" required value={serviceValue} onValueChange={setServiceValue}>
                    <SelectTrigger id="serviceType">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(service => (
                        <SelectItem key={service} value={service}>{service}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {state.errors?.serviceType && <p className="text-sm text-destructive">{state.errors.serviceType}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" placeholder="Tell us about your project..." rows={5} required />
                  {state.errors?.message && <p className="text-sm text-destructive">{state.errors.message}</p>}
                </div>
                <SubmitButton />
              </form>
            </CardContent>
          </Card>
        </AnimatedWrapper>
      </div>
    </section>
  );
}
