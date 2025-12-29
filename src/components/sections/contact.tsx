
'use client';

import { useState } from 'react';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp, getDocs, query, where, writeBatch, doc, runTransaction } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import type { UserProfile } from '@/lib/types';


const services = [
  'Thesis & Dissertation Writing',
  'Research Paper Writing',
  'Data Analysis',
  'Book Publishing',
  'Institutional Branding',
  'Other',
];


async function assignLeadToSales(firestore: any): Promise<string | null> {
    const salesTeamQuery = query(collection(firestore, 'users'), where('role', '==', 'sales-team'));
    const salesTeamSnapshot = await getDocs(salesTeamQuery);
    const salesTeam = salesTeamSnapshot.docs.map(doc => doc.id);

    if (salesTeam.length === 0) {
        return null; // No one to assign to
    }
    
    // Use a transaction to get the current index and increment it atomically
    const metadataRef = doc(firestore, 'metadata', 'leadAssignment');
    let nextIndex = 0;

    await runTransaction(firestore, async (transaction) => {
        const metadataDoc = await transaction.get(metadataRef);
        if (!metadataDoc.exists()) {
            nextIndex = 0;
        } else {
            const currentIndex = metadataDoc.data().salesLeadIndex || 0;
            nextIndex = (currentIndex + 1) % salesTeam.length;
        }
        transaction.set(metadataRef, { salesLeadIndex: nextIndex }, { merge: true });
    });
    
    return salesTeam[nextIndex];
}


async function notifyAdminsAndSales(firestore: any, message: string, assignedSalesId: string | null = null) {
    try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('role', '==', 'admin'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty && !assignedSalesId) return;

        const batch = writeBatch(firestore);
        const notificationsRef = collection(firestore, 'notifications');
        
        querySnapshot.forEach(docSnap => {
            const user = docSnap.data() as UserProfile;
            const newNotifRef = doc(notificationsRef);
            batch.set(newNotifRef, {
                userId: user.uid,
                message: message,
                isRead: false,
                createdAt: serverTimestamp(),
            });
        });

        if (assignedSalesId) {
             const newNotifRef = doc(notificationsRef);
             batch.set(newNotifRef, {
                userId: assignedSalesId,
                message: `New website lead assigned to you: "${message}"`,
                isRead: false,
                createdAt: serverTimestamp(),
            });
        }

        await batch.commit();

    } catch (error) {
        console.error("Failed to send notifications to staff:", error);
    }
}


export function Contact() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(Date.now()); // To reset form
  const firestore = useFirestore();
  const { toast } = useToast();

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
      const assignedSalesId = await assignLeadToSales(firestore);

      const data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        serviceType: formData.get('serviceType') as string,
        message: formData.get('message') as string,
        status: 'new',
        createdAt: serverTimestamp(),
        assignedSalesId: assignedSalesId,
      };

      if (!data.name || !data.email || !data.phone) {
        throw new Error("Please fill out all required fields.");
      }
      
      const leadsCollection = collection(firestore, 'contact_leads');
      await addDoc(leadsCollection, data);
      
      // Notify staff
      await notifyAdminsAndSales(firestore, `New website lead from: ${data.name}.`, assignedSalesId);

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
    </section>
  );
}
