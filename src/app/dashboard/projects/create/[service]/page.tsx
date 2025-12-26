'use client';

import React, { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { createProject, type ProjectFormState } from '@/app/actions';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, LoaderCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const serviceTypes = {
  writing: [
    "thesis-dissertation", 
    "research-paper", 
    "book-writing",
    "review-paper",
  ],
  publication: [
    "research-publication",
    "book-publishing"
  ]
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
       {pending ? <LoaderCircle className="animate-spin" /> : <><Send className="mr-2" /> Submit Project</>}
    </Button>
  );
}

const initialState: ProjectFormState = {
  message: '',
  errors: undefined,
  success: false,
};

export default function CreateProjectPage({ params }: { params: { service: string }}) {
  const { user } = useUser();
  const [state, formAction] = useActionState(createProject, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  const defaultServiceType = searchParams.get('serviceType');
  
  const [deadline, setDeadline] = React.useState<Date | undefined>();
  const [selectedService, setSelectedService] = React.useState<string | undefined>(defaultServiceType || undefined);
  const [wantToPublish, setWantToPublish] = useState(false);

  const currentServiceTypes = params.service === 'writing' 
    ? serviceTypes.writing 
    : serviceTypes.publication;
  
  const pageTitle = params.service === 'writing' ? 'New Writing Project' : 'New Publication Project';
  

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Project Created!',
          description: state.message,
        });
        formRef.current?.reset();
        setDeadline(undefined);
        setWantToPublish(false);
        setSelectedService(undefined);
        router.push('/dashboard/projects');
      } else {
        toast({
          title: 'Error Creating Project',
          description: state.message,
          variant: 'destructive',
        });
      }
    }
  }, [state, toast, router]);

  const isThesisDissertation = selectedService === 'thesis-dissertation';
  const isResearchOrReview = selectedService === 'research-paper' || selectedService === 'review-paper';


  if (!user) {
    return null; // Layout handles auth
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">{pageTitle}</h1>
        <form ref={formRef} action={formAction} className="space-y-8">
           <input type="hidden" name="userId" value={user.uid} />

           {/* --- Basic Information --- */}
           <Card className="shadow-soft">
             <CardHeader>
                <CardTitle>Basic Information</CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Label htmlFor="title">Project Title</Label>
                    <Input id="title" name="title" placeholder="e.g., A Study on AI in Healthcare" required />
                    {state.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Select name="serviceType" required defaultValue={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger id="serviceType">
                        <SelectValue placeholder="Select a service type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {currentServiceTypes.map(service => (
                          <SelectItem key={service} value={service}>{service.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                     {state.errors?.serviceType && <p className="text-sm text-destructive">{state.errors.serviceType[0]}</p>}
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input id="topic" name="topic" placeholder="e.g., Diagnostic Algorithms" />
                 </div>
             </CardContent>
           </Card>

           {/* --- Dynamic Fields based on Service Selection --- */}
           {selectedService && (
             <>
                {/* --- Academic / Project Details --- */}
                <Card className="shadow-soft">
                    <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                       <div className="space-y-3">
                           <Label>Course Level</Label>
                           <RadioGroup name="courseLevel" className="flex gap-4">
                               <div className="flex items-center space-x-2">
                                 <RadioGroupItem value="ug" id="ug" />
                                 <Label htmlFor="ug">Undergraduate (UG)</Label>
                               </div>
                               <div className="flex items-center space-x-2">
                                 <RadioGroupItem value="pg" id="pg" />
                                 <Label htmlFor="pg">Postgraduate (PG)</Label>
                               </div>
                                <div className="flex items-center space-x-2">
                                 <RadioGroupItem value="phd" id="phd" />
                                 <Label htmlFor="phd">PhD</Label>
                               </div>
                           </RadioGroup>
                       </div>
                       <div className="space-y-2">
                           <Label htmlFor="language">Language</Label>
                           <Input id="language" name="language" placeholder="e.g., English (UK)" defaultValue="English" />
                       </div>

                       {isThesisDissertation && (
                         <div className="space-y-2">
                            <Label htmlFor="referencingStyle">Referencing Style</Label>
                            <Input id="referencingStyle" name="referencingStyle" placeholder="e.g., APA 7th Edition" />
                         </div>
                       )}

                       <div className="grid md:grid-cols-2 gap-6">
                           {isThesisDissertation && (
                                <div className="space-y-2">
                                    <Label htmlFor="pageCount">Estimated Page Count</Label>
                                    <Input id="pageCount" name="pageCount" type="number" placeholder="e.g., 100" />
                                </div>
                           )}
                           {isResearchOrReview && (
                                <div className="space-y-2">
                                    <Label htmlFor="wordCount">Estimated Word Count</Label>
                                    <Input id="wordCount" name="wordCount" type="number" placeholder="e.g., 25000" />
                                </div>
                           )}
                       </div>
                       
                        <div className="space-y-2">
                          <Label htmlFor="deadline">Project Deadline</Label>
                          <Popover>
                              <PopoverTrigger asChild>
                              <Button
                                  variant={"outline"}
                                  className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !deadline && "text-muted-foreground"
                                  )}
                              >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                              </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                 <Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus />
                              </PopoverContent>
                          </Popover>
                          <input type="hidden" name="deadline" value={deadline?.toISOString()} />
                       </div>
                       <div className="space-y-2">
                          <Label htmlFor="synopsisFile">Synopsis/Assignment File (Optional)</Label>
                          <Input id="synopsisFile" name="synopsisFile" type="file" className="pt-2" />
                          <p className="text-xs text-muted-foreground">Upload your synopsis, research materials, or any relevant files.</p>
                       </div>
                    </CardContent>
                </Card>


                {/* --- Publishing --- */}
                <Card className="shadow-soft">
                    <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="wantToPublish" name="wantToPublish" checked={wantToPublish} onCheckedChange={(checked) => setWantToPublish(Boolean(checked))} />
                            <Label htmlFor="wantToPublish">Do you want to publish this work?</Label>
                        </div>
                        {wantToPublish && (
                          <div className="space-y-2">
                            <Label htmlFor="publishWhere">If yes, where do you want to publish?</Label>
                            <Textarea id="publishWhere" name="publishWhere" placeholder="e.g., Scopus-indexed journals, a specific conference..." />
                          </div>
                        )}
                    </CardContent>
                </Card>
             </>
           )}


          <SubmitButton />
        </form>
    </div>
  );
}
