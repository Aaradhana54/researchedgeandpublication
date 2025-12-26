'use client';

import { AnimatedWrapper } from '@/components/animated-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const services = [
  'Thesis & Dissertation Writing',
  'Research Paper Writing',
  'Data Analysis',
  'Book Publishing',
  'Institutional Branding',
  'Other',
];

export function Contact() {
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
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" placeholder="John Doe" required />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service of Interest</Label>
                  <Select name="serviceType" required>
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
                  <Textarea id="message" name="message" placeholder="Tell us about your project..." rows={5} required />
                </div>
                <Button type="button" className="w-full" size="lg" disabled>
                   Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </AnimatedWrapper>
      </div>
    </section>
  );
}
