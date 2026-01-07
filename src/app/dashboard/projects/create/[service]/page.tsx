
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, LoaderCircle, Upload } from 'lucide-react';
import type { ProjectServiceType, CourseLevel } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useFirestore, useStorage } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Progress } from '@/components/ui/progress';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { assignLeadToSalesPerson } from '@/firebase/utils';


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


export default function CreateProjectPage() {
  const params = useParams();
  const service = params.service as ProjectServiceType;
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formKey, setFormKey] = useState(Date.now()); // Used to reset the form


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore || !user) {
      setError("User not authenticated or Firestore not available.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const rawFormData = Object.fromEntries(formData.entries());

    if (!rawFormData.title) {
        setError("Project Title is required.");
        setLoading(false);
        return;
    }
    
    const assignedSalesId = await assignLeadToSalesPerson(firestore);

    const dataToSave: any = {
      userId: user.uid,
      title: rawFormData.title as string,
      serviceType: service,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      mobile: (rawFormData.mobile as string) || null,
      topic: (rawFormData.topic as string) || null,
      courseLevel: (rawFormData.courseLevel as CourseLevel) || null,
      referencingStyle: (rawFormData.referencingStyle as string) || null,
      language: (rawFormData.language as string) || 'English',
      wantToPublish: rawFormData.wantToPublish === 'on',
      publishWhere: (rawFormData.publishWhere as string) || null,
      assignedSalesId: assignedSalesId,
    };

    // Conditionally add fields that might be null or numbers
    if (rawFormData.deadline) {
        dataToSave.deadline = Timestamp.fromDate(new Date(rawFormData.deadline as string));
    }
    if (rawFormData.pageCount) {
        dataToSave.pageCount = Number(rawFormData.pageCount);
    }
    if (rawFormData.wordCount) {
        dataToSave.wordCount = Number(rawFormData.wordCount);
    }
    
    const projectsCollection = collection(firestore, 'projects');
    
    addDoc(projectsCollection, dataToSave)
      .then(() => {
          toast({
              title: 'Project Submitted!',
              description: 'Your project has been successfully submitted for review.',
          });
          setFormKey(Date.now()); 
          router.push('/dashboard/projects');
      })
      .catch((serverError) => {
          const permissionError = new FirestorePermissionError({
            path: projectsCollection.path,
            operation: 'create',
            requestResourceData: dataToSave,
          } satisfies SecurityRuleContext, serverError);

          errorEmitter.emit('permission-error', permissionError);
          setError("Failed to create project due to a permissions issue.");
      }).finally(() => {
          setLoading(false);
      });
  }


  if (userLoading || !firestore) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
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
  
  const commonFields = ({ mobileRequired = false }: { mobileRequired?: boolean }) => (
    <div className="space-y-2">
        <Label htmlFor="mobile">Mobile No. (for this project){mobileRequired ? ' *' : ''}</Label>
        <Input 
          id="mobile" 
          name="mobile" 
          type="tel"
          defaultValue={user?.mobile || ''}
          placeholder="Enter a contact number"
          disabled={loading}
          required={mobileRequired}
        />
      </div>
  );
  
  const renderResearchPublicationForm = () => (
    <>
       <div className="space-y-2">
        <Label htmlFor="publishWhere">Where to Publish?</Label>
        <Textarea id="publishWhere" name="publishWhere" placeholder="e.g., Scopus, SCI, specific journal name..." disabled={loading}/>
      </div>
       {commonFields({ mobileRequired: true })}
    </>
  );


  const renderThesisForm = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <Input id="topic" name="topic" placeholder="e.g., The Impact of AI on Modern Literature" disabled={loading}/>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="courseLevel">Course Level</Label>
          <Select name="courseLevel" disabled={loading}>
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
          <Input id="deadline" name="deadline" type="date" disabled={loading}/>
        </div>
      </div>
      
      {commonFields({ mobileRequired: false })}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="referencingStyle">Referencing Style</Label>
          <Input id="referencingStyle" name="referencingStyle" placeholder="e.g., APA, MLA, Chicago" disabled={loading}/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pageCount">Page Count</Label>
          <Input id="pageCount" name="pageCount" type="number" placeholder="e.g., 100" disabled={loading}/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input id="language" name="language" placeholder="e.g., English, Spanish" defaultValue="English" disabled={loading}/>
        </div>
      </div>
    </>
  );

  const renderPaperForm = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <Input id="topic" name="topic" placeholder="e.g., Quantum Computing in Cybersecurity" disabled={loading}/>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="wordCount">Word Count</Label>
          <Input id="wordCount" name="wordCount" type="number" placeholder="e.g., 5000" disabled={loading}/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input id="language" name="language" placeholder="e.g., English" defaultValue="English" disabled={loading}/>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="courseLevel">Course Level</Label>
          <Select name="courseLevel" disabled={loading}>
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
          <Input id="deadline" name="deadline" type="date" disabled={loading}/>
        </div>
      </div>

      {commonFields({ mobileRequired: false })}

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="wantToPublish" name="wantToPublish" disabled={loading}/>
          <Label htmlFor="wantToPublish" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Do you want to publish this paper?
          </Label>
        </div>
        
        <div data-testid="publish-where-container" className="space-y-2">
          <Label htmlFor="publishWhere">Where to Publish (e.g., Scopus, SCI, specific journal name)</Label>
          <Textarea id="publishWhere" name="publishWhere" placeholder="Let us know your target journal or index..." disabled={loading}/>
        </div>
      </div>
    </>
  );

    const renderBookWritingForm = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="topic">Topic *</Label>
        <Input id="topic" name="topic" placeholder="e.g., A History of Ancient Rome" disabled={loading} required/>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="pageCount">Total Pages *</Label>
          <Input id="pageCount" name="pageCount" type="number" placeholder="e.g., 300" disabled={loading} required/>
        </div>
         <div className="space-y-2">
            {commonFields({ mobileRequired: true })}
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
          <form key={formKey} onSubmit={handleSubmit} className="space-y-6">
             {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
             )}
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input id="title" name="title" placeholder="A concise title for your project" required disabled={loading}/>
            </div>

            {service === 'thesis-dissertation' && renderThesisForm()}
            {(service === 'research-paper' || service === 'review-paper') && renderPaperForm()}
            {service === 'research-publication' && renderResearchPublicationForm()}
            {(service === 'book-writing' || service === 'book-publishing') && renderBookWritingForm()}

            <div className="flex justify-end pt-4">
               <Button size="lg" type="submit" className="w-full sm:w-auto" disabled={loading}>
                {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Submit Project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
