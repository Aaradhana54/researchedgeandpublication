
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
import { LoaderCircle, Star } from 'lucide-react';
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
    <section id="feedback" className="w-full py-16 md:py-24 lg:py-32">
      <div className="container mx-auto">
        <AnimatedWrapper>
          <Card className="max-w-2xl mx-auto shadow-lift">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">Leave a Feedback</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Your opinion matters to us. Share your experience.
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
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="john.doe@example.com" disabled={loading}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="designation">Designation</Label>
                        <Input id="designation" name="designation" placeholder="e.g. Student, Professor" disabled={loading}/>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Rating *</Label>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={cn(
                                    'w-8 h-8 cursor-pointer transition-colors',
                                    (hoverRating >= star || rating >= star)
                                        ? 'text-yellow-400 fill-yellow-400'
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
                  <Textarea id="message" name="message" placeholder="Tell us about your experience..." rows={5} required disabled={loading}/>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                   {loading ? <LoaderCircle className="animate-spin"/> : "Submit Feedback"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </AnimatedWrapper>
      </div>
    </section>
  );
}
