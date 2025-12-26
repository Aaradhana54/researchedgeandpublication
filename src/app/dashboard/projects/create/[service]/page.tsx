

'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { ProjectServiceType, CourseLevel } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useActionState } from 'react';
import { createProject, type ProjectFormState } from '@/app/actions';
import { FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const serviceDisplayNames: Record<ProjectServiceType, string> = {
  'thesis-dissertation': 'New Thesis / Dissertation Project',
  'research-paper': 'New Research Paper Project',
  'book-writing': 'New Book Writing Project',
  'review-paper': 'New Review Paper Project',
  'research-publication': 'New Research Publication Project',
  'book-publishing': 'New Book Publishing Project',
};

const courseLevels: { label: string, value: CourseLevel }[] = [
  { label: 'Undergraduate (UG)', value: 'ug' },
  { label: 'Postgraduate (PG)', value: 'pg' },
  { label: 'Doctorate (PhD)', value: 'phd' },
];

function SubmitButton() {
  // This component will be used inside the form to show a loading state, but we need to implement `useFormStatus`.
  // For now, we'll keep the button logic in the main component.
  return (
    <Button size="lg" type="submit" className="w-full sm:w-auto">
      Submit Project
    </Button>
  );
}

export default function CreateProjectPage() {
  const params = useParams();
  const service = params.service as ProjectServiceType;
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const initialState: ProjectFormState = { message: '', errors: {}, success: false };
  const [state, formAction] = useActionState(createProject, initialState);

  const [formKey, setFormKey] = useState(Date.now()); // Used to reset the form

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Project Submitted!',
        description: 'Your project has been successfully submitted for review.',
      });
      setFormKey(Date.now()); // Reset form by changing key
      router.push('/dashboard/projects');
    }
  }, [state, toast, router]);

  if (userLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // This should ideally not happen due to the layout, but as a safeguard:
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p>You need to be logged in to create a project.</p>
      </div>
    );
  }

  if (!service || !serviceDisplayNames[service]) {
    notFound();
  }
  
  const pageTitle = serviceDisplayNames[service];

  const renderThesisForm = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="topic">Topic *</Label>
        <Input id="topic" name="topic" placeholder="e.g., The Impact of AI on Modern Literature" />
        {state.errors?.topic && <FormMessage>{state.errors.topic[0]}</FormMessage>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="courseLevel">Course Level *</Label>
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
           {state.errors?.courseLevel && <FormMessage>{state.errors.courseLevel[0]}</FormMessage>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline</Label>
          <Input id="deadline" name="deadline" type="date" />
           {state.errors?.deadline && <FormMessage>{state.errors.deadline[0]}</FormMessage>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="synopsisFile">Synopsis/Assignment File (Optional)</Label>
        <Input id="synopsisFile" name="synopsisFile" type="file" disabled />
        <p className="text-xs text-muted-foreground">File uploads are under construction.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="referencingStyle">Referencing Style *</Label>
          <Input id="referencingStyle" name="referencingStyle" placeholder="e.g., APA, MLA, Chicago" />
          {state.errors?.referencingStyle && <FormMessage>{state.errors.referencingStyle[0]}</FormMessage>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="pageCount">Page Count</Label>
          <Input id="pageCount" name="pageCount" type="number" placeholder="e.g., 100" />
           {state.errors?.pageCount && <FormMessage>{state.errors.pageCount[0]}</FormMessage>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language *</Label>
          <Input id="language" name="language" placeholder="e.g., English, Spanish" defaultValue="English" />
           {state.errors?.language && <FormMessage>{state.errors.language[0]}</FormMessage>}
        </div>
      </div>
    </>
  );

  const renderPaperForm = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <Input id="topic" name="topic" placeholder="e.g., Quantum Computing in Cybersecurity" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="wordCount">Word Count</Label>
          <Input id="wordCount" name="wordCount" type="number" placeholder="e.g., 5000" />
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline</Label>
          <Input id="deadline" name="deadline" type="date" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="synopsisFile">Supporting File (Optional)</Label>
        <Input id="synopsisFile" name="synopsisFile" type="file" disabled />
        <p className="text-xs text-muted-foreground">File uploads are under construction.</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="wantToPublish" name="wantToPublish" />
          <Label htmlFor="wantToPublish" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Do you want to publish this paper?
          </Label>
        </div>
        
        <div data-testid="publish-where-container" className="space-y-2">
          <Label htmlFor="publishWhere">Where do you want to publish it? (e.g., Scopus, SCI, specific journal name)</Label>
          <Textarea id="publishWhere" name="publishWhere" placeholder="Let us know your target journal or index..." />
        </div>

      </div>
    </>
  );

    const renderBookWritingForm = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <Input id="topic" name="topic" placeholder="e.g., A History of Ancient Rome" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="pageCount">Page Count</Label>
          <Input id="pageCount" name="pageCount" type="number" placeholder="e.g., 300" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language (Mode)</Label>
          <Input id="language" name="language" placeholder="e.g., English" defaultValue="English" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline</Label>
        <Input id="deadline" name="deadline" type="date" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="manuscriptFile">Manuscript/Synopsis (Optional)</Label>
        <Input id="manuscriptFile" name="manuscriptFile" type="file" disabled />
        <p className="text-xs text-muted-foreground">File uploads are under construction.</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="wantToPublish" name="wantToPublish" />
          <Label htmlFor="wantToPublish" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Want to publish with us?
          </Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="publishWhere">Where? (e.g., Amazon, B&N, IngramSpark)</Label>
          <Input id="publishWhere" name="publishWhere" placeholder="Let us know your preferred platforms" />
        </div>
        
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
          <CardDescription>Fields marked with * are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form key={formKey} action={formAction} className="space-y-6">
             <input type="hidden" name="userId" value={user.uid} />
             <input type="hidden" name="serviceType" value={service} />
             {state.errors?._form && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.errors._form.join(', ')}</AlertDescription>
                </Alert>
             )}
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input id="title" name="title" placeholder="A concise title for your project" />
              {state.errors?.title && <FormMessage>{state.errors.title[0]}</FormMessage>}
            </div>

            {service === 'thesis-dissertation' && renderThesisForm()}
            {(service === 'research-paper' || service === 'review-paper' || service === 'research-publication') && renderPaperForm()}
            {(service === 'book-writing' || service === 'book-publishing') && renderBookWritingForm()}

            <div className="flex justify-end pt-4">
               <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
