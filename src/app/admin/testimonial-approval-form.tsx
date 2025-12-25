'use client';

import { useActionState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { submitTestimonialForApproval, type TestimonialApprovalState } from '@/app/actions';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const initialState: TestimonialApprovalState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <LoaderCircle className="animate-spin" /> : 'Approve with AI'}
    </Button>
  );
}

export function TestimonialApprovalForm() {
  const [state, formAction] = useActionState(submitTestimonialForApproval, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message && state.result) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div>
      <form ref={formRef} action={formAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Author's Name</Label>
          <Input id="name" name="name" placeholder="e.g., Dr. Jane Smith" />
          {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="designation">Author's Designation</Label>
          <Input id="designation" name="designation" placeholder="e.g., Lead Researcher, Acme University" />
          {state.errors?.designation && <p className="text-sm text-destructive">{state.errors.designation}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Testimonial Message</Label>
          <Textarea id="message" name="message" placeholder="Enter the testimonial content here..." rows={5} />
          {state.errors?.message && <p className="text-sm text-destructive">{state.errors.message}</p>}
        </div>
        <SubmitButton />
      </form>

      {state.result && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-center mb-4">AI Analysis Result</h3>
          <Card className={cn(
            'shadow-md',
            state.result.approved ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          )}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {state.result.approved ? (
                  <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                )}
                <div>
                  <p className={cn(
                    'text-xl font-bold',
                    state.result.approved ? 'text-green-700' : 'text-red-700'
                  )}>
                    {state.result.approved ? 'Approved' : 'Rejected'}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    <strong>Reason:</strong> {state.result.reason}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
