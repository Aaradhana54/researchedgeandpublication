'use client';

import { useEffect, useRef, useState } from 'react';
import { useActionState } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { useFormStatus } from 'react-dom';

import { createProject, type ProjectFormState } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LoaderCircle, CalendarIcon, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { ProjectServiceType } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

const serviceDisplayNames: Record<ProjectServiceType, string> = {
    'thesis-dissertation': 'New Thesis / Dissertation Project',
    'research-paper': 'New Research Paper Project',
    'book-writing': 'New Book Writing Project',
    'review-paper': 'New Review Paper Project',
    'research-publication': 'New Research Publication Project',
    'book-publishing': 'New Book Publishing Project',
};

const courseLevels = [
    { label: 'Undergraduate (UG)', value: 'ug' },
    { label: 'Postgraduate (PG)', value: 'pg' },
    { label: 'Doctorate (PhD)', value: 'phd' },
];

const initialProjectFormState: ProjectFormState = {
  message: '',
  errors: undefined,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button size="lg" type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : (
        'Submit Project'
      )}
    </Button>
  );
}

export default function CreateProjectPage() {
  const params = useParams();
  const service = params.service as ProjectServiceType;
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [state, formAction] = useActionState(createProject, initialProjectFormState);
  
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [wantToPublish, setWantToPublish] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Project Submitted!',
        description: state.message,
      });
      formRef.current?.reset();
      setDeadline(undefined);
      setWantToPublish(false);
      // Redirect after a short delay to allow toast to be seen
      setTimeout(() => {
        router.push('/dashboard/projects');
      }, 1500);
    } else if (state.message && !state.success && !state.errors) {
      // This case handles server-side errors that are not validation errors (e.g., database errors)
      toast({
        title: 'Submission Failed',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, router, toast]);


  if (!service || !serviceDisplayNames[service]) {
    notFound();
  }

  const pageTitle = serviceDisplayNames[service];

  const renderThesisForm = () => (
    <>
        <div className="space-y-2">
            <Label htmlFor="topic">Topic *</Label>
            <Input id="topic" name="topic" placeholder="e.g., The Impact of AI on Modern Literature" />
            {state.errors?.topic && <p className="text-sm text-destructive mt-1">{state.errors.topic[0]}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="courseLevel">Course Level</Label>
                 <Select name="courseLevel">
                    <SelectTrigger id="courseLevel">
                        <SelectValue placeholder="Select course level" />
                    </SelectTrigger>
                    <SelectContent>
                        {courseLevels.map(level => (
                           <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 {state.errors?.courseLevel && <p className="text-sm text-destructive mt-1">{state.errors.courseLevel[0]}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
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
                        <Calendar
                            mode="single"
                            selected={deadline}
                            onSelect={setDeadline}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <Input type="hidden" name="deadline" value={deadline?.toISOString() || ''} />
                {state.errors?.deadline && <p className="text-sm text-destructive mt-1">{state.errors.deadline[0]}</p>}
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="synopsisFile">Synopsis/Assignment File (Optional)</Label>
            <Input id="synopsisFile" name="synopsisFile" type="file" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="space-y-2">
                <Label htmlFor="referencingStyle">Referencing Style</Label>
                <Input id="referencingStyle" name="referencingStyle" placeholder="e.g., APA, MLA, Chicago" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="pageCount">Page Count</Label>
                <Input id="pageCount" name="pageCount" type="number" placeholder="e.g., 100" />
                 {state.errors?.pageCount && <p className="text-sm text-destructive mt-1">{state.errors.pageCount[0]}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input id="language" name="language" placeholder="e.g., English, Spanish" defaultValue="English" />
            </div>
        </div>
    </>
  );

  const renderPaperForm = () => (
     <>
        <div className="space-y-2">
            <Label htmlFor="topic">Topic *</Label>
            <Input id="topic" name="topic" placeholder="e.g., Quantum Computing in Cybersecurity" />
            {state.errors?.topic && <p className="text-sm text-destructive mt-1">{state.errors.topic[0]}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="wordCount">Word Count</Label>
                <Input id="wordCount" name="wordCount" type="number" placeholder="e.g., 5000" />
                 {state.errors?.wordCount && <p className="text-sm text-destructive mt-1">{state.errors.wordCount[0]}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input id="language" name="language" placeholder="e.g., English" defaultValue="English" />
            </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="courseLevel">Course Level</Label>
                 <Select name="courseLevel">
                    <SelectTrigger id="courseLevel">
                        <SelectValue placeholder="Select course level" />
                    </SelectTrigger>
                    <SelectContent>
                        {courseLevels.map(level => (
                           <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 {state.errors?.courseLevel && <p className="text-sm text-destructive mt-1">{state.errors.courseLevel[0]}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn( "w-full justify-start text-left font-normal", !deadline && "text-muted-foreground" )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus />
                    </PopoverContent>
                </Popover>
                <Input type="hidden" name="deadline" value={deadline?.toISOString() || ''} />
                {state.errors?.deadline && <p className="text-sm text-destructive mt-1">{state.errors.deadline[0]}</p>}
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="synopsisFile">Supporting File (Optional)</Label>
            <Input id="synopsisFile" name="synopsisFile" type="file" />
        </div>

        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <Checkbox id="wantToPublish" name="wantToPublish" checked={wantToPublish} onCheckedChange={(checked) => setWantToPublish(checked as boolean)} />
                <Label htmlFor="wantToPublish" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Do you want to publish this paper?
                </Label>
            </div>
            {wantToPublish && (
                 <div className="space-y-2">
                    <Label htmlFor="publishWhere">Where do you want to publish it? (e.g., Scopus, SCI, specific journal name)</Label>
                    <Textarea id="publishWhere" name="publishWhere" placeholder="Let us know your target journal or index..." />
                </div>
            )}
        </div>
     </>
  );

  const renderBookWritingForm = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="topic">Topic *</Label>
        <Input id="topic" name="topic" placeholder="e.g., A History of Ancient Rome" />
        {state.errors?.topic && <p className="text-sm text-destructive mt-1">{state.errors.topic[0]}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="pageCount">Page Count</Label>
          <Input id="pageCount" name="pageCount" type="number" placeholder="e.g., 300" />
          {state.errors?.pageCount && <p className="text-sm text-destructive mt-1">{state.errors.pageCount[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language (Mode)</Label>
          <Input id="language" name="language" placeholder="e.g., English" defaultValue="English" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus />
          </PopoverContent>
        </Popover>
        <Input type="hidden" name="deadline" value={deadline?.toISOString() || ''} />
        {state.errors?.deadline && <p className="text-sm text-destructive mt-1">{state.errors.deadline[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="synopsisFile">Manuscript/Synopsis (Optional)</Label>
        <Input id="synopsisFile" name="synopsisFile" type="file" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="wantToPublish" name="wantToPublish" checked={wantToPublish} onCheckedChange={(checked) => setWantToPublish(checked as boolean)} />
          <Label htmlFor="wantToPublish" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Want to publish with us?
          </Label>
        </div>
        {wantToPublish && (
          <div className="space-y-2">
            <Label htmlFor="publishWhere">Where? (e.g., Amazon, B&N, IngramSpark)</Label>
            <Input id="publishWhere" name="publishWhere" placeholder="Let us know your preferred platforms" />
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4 -ml-4">
                <Link href="/dashboard/projects">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Projects
                </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
            <p className="text-muted-foreground">Please fill in the details for your new project.</p>
        </div>

        <Card className="max-w-4xl">
            <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>All fields marked with an asterisk (*) are required.</CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={formAction} className="space-y-6">
                    <input type="hidden" name="serviceType" value={service} />
                    <input type="hidden" name="userId" value={user?.uid || ''} />

                    <div className="space-y-2">
                        <Label htmlFor="title">Project Title *</Label>
                        <Input id="title" name="title" placeholder="A concise title for your project" />
                         {state.errors?.title && <p className="text-sm text-destructive mt-1">{state.errors.title[0]}</p>}
                    </div>

                    {service === 'thesis-dissertation' && renderThesisForm()}
                    {(service === 'research-paper' || service === 'review-paper') && renderPaperForm()}
                    {service === 'book-writing' && renderBookWritingForm()}

                    {/* Placeholder for other service forms */}
                    {(service === 'research-publication' || service === 'book-publishing') && (
                        <p className="text-center text-muted-foreground py-8">This form is under construction. Please check back later.</p>
                    )}


                    <div className="flex justify-end pt-4">
                       {/* Only show submit button if form is implemented */}
                       {(service === 'thesis-dissertation' || service === 'research-paper' || service === 'review-paper' || service === 'book-writing') && (
                           <SubmitButton />
                       )}
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
