
'use client';

import { useState } from 'react';
import { AnimatedWrapper } from '@/components/animated-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Star, Mail, Phone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { cn } from '@/lib/utils';

export function FeedbackForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(Date.now());
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) {
      setError("Could not connect to the database. Please try again later.");
      return;
    }
     if (rating === 0) {
        setError("Please select a star rating.");
        return;
    }


    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        designation: formData.get('designation') as string,
        message: formData.get('message') as string,
        rating: rating,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      if (!data.name || !data.message) {
        throw new Error("Please fill out all required fields.");
      }
      
      const feedbacksCollection = collection(firestore, 'feedbacks');
      await addDoc(feedbacksCollection, data);
      
      toast({
        title: 'Feedback Sent!',
        description: "Thank you for your valuable feedback.",
      });

      setFormKey(Date.now());
      setRating(0);

    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <section id="feedback" className="w-full bg-secondary py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedWrapper>
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">Share Your Experience</h2>
                    <p className="text-lg text-muted-foreground">
                        Your feedback is invaluable to us. It helps us improve our services and better understand your needs. Please take a moment to share your thoughts, and thank you for being a part of our journey.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-full"><Mail className="w-6 h-6 text-primary"/></div>
                             <a href="mailto:revio1803@gmail.com" className="text-muted-foreground text-lg hover:text-primary transition-colors">
                                revio1803@gmail.com
                            </a>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-full"><Phone className="w-6 h-6 text-primary"/></div>
                            <span className="text-muted-foreground text-lg">+91 88899 32922</span>
                        </div>
                    </div>
                </div>
            </AnimatedWrapper>
            <AnimatedWrapper delay={200}>
                <Card className="shadow-lift">
                    <CardHeader>
                    <CardTitle className="text-2xl">Leave a Feedback</CardTitle>
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
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" name="email" type="email" placeholder="john.doe@example.com" disabled={loading}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="designation">Designation</Label>
                                <Input id="designation" name="designation" placeholder="e.g. Student, Professor" disabled={loading}/>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Your Rating *</Label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={cn(
                                            'w-7 h-7 cursor-pointer transition-all duration-200',
                                            (hoverRating >= star || rating >= star)
                                                ? 'text-yellow-400 fill-yellow-400 scale-110'
                                                : 'text-gray-300'
                                        )}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea id="message" name="message" placeholder="Tell us about your experience..." rows={4} required disabled={loading}/>
                        </div>
                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                        {loading ? <LoaderCircle className="animate-spin"/> : "Submit Feedback"}
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
