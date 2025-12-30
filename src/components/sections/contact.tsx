'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const services = [
  'Thesis & Dissertation Writing',
  'Research Paper Writing',
  'Data Analysis',
  'Book Publishing',
  'Institutional Branding',
  'Other',
];


export function Contact() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(Date.now()); // To reset form
  const firestore = useFirestore();
  const { toast } = useToast();

  const contactImage = PlaceHolderImages.find(p => p.id === 'contact-us');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) {
      setError("Could not connect to the database. Please try again later.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      
      const data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        serviceType: formData.get('serviceType') as string,
        message: formData.get('message') as string,
        status: 'new',
        createdAt: serverTimestamp(),
        assignedSalesId: null, // Lead is unassigned initially
      };

      if (!data.name || !data.email || !data.phone) {
        throw new Error("Please fill out all required fields.");
      }
      
      const leadsCollection = collection(firestore, 'contact_leads');
      await addDoc(leadsCollection, data);
      
      toast({
        title: 'Message Sent!',
        description: "Thank you for reaching out. We'll be in touch shortly.",
      });

      setFormKey(Date.now()); // This will reset the form fields by re-rendering the form

    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <section id="contact" className="w-full bg-background py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">Contact Us</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedWrapper>
                {contactImage && (
                    <div className="overflow-hidden rounded-lg shadow-lift h-full max-h-[500px] md:max-h-full">
                        <Image
                            src={contactImage.imageUrl}
                            alt={contactImage.description}
                            width={600}
                            height={700}
                            data-ai-hint={contactImage.imageHint}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                    </div>
                )}
            </AnimatedWrapper>
             <AnimatedWrapper delay={200}>
                <Card className="shadow-lift">
                    <CardHeader className="text-center">
                        <CardDescription>We'd love to hear from you. Fill out the form to get in touch.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <form key={formKey} onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" name="name" placeholder="John Doe" required disabled={loading} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required disabled={loading}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" required disabled={loading}/>
                        </div>
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="serviceType">Service of Interest</Label>
                        <Select name="serviceType" disabled={loading}>
                            <SelectTrigger id="serviceType">
                            <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                            <SelectContent>
                            {services.map(service => (
                                <SelectItem key={service} value={service}>{service}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" name="message" placeholder="Tell us about your project..." rows={5} disabled={loading}/>
                        </div>
                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                        {loading ? <LoaderCircle className="animate-spin"/> : "Send Message"}
                        </Button>
                    </form>
                    </CardContent>
                </Card>
            </AnimatedWrapper>
        </div>
      </div>
    </section>
  );
}
