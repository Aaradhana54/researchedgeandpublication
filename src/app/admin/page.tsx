import { TestimonialApprovalForm } from './testimonial-approval-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <main className="w-full max-w-2xl">
        <Card className="shadow-lift">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-primary sm:text-4xl font-headline">
              Testimonial Approval Tool
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              Use this tool to review and approve new testimonials with AI assistance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TestimonialApprovalForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
