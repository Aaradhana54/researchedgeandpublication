

'use client';

import { useState } from 'react';
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
import type { ProjectServiceType } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { FormMessage } from '@/components/ui/form';

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


export default function CreateProjectPage() {
  const params = useParams();
  const service = params.service as ProjectServiceType;
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [wantToPublish, setWantToPublish] = useState(false);

  if (userLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
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
        <Label htmlFor="topic">Topic</Label>
        <Input id="topic" name="topic" placeholder="e.g., The Impact of AI on Modern Literature" />
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
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="synopsisFile">Synopsis/Assignment File (Optional)</Label>
        <Input id="synopsisFile" name="synopsisFile" type="file" disabled />
        <p className="text-xs text-muted-foreground">File uploads are under construction.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="referencingStyle">Referencing Style</Label>
          <Input id="referencingStyle" name="referencingStyle" placeholder="e.g., APA, MLA, Chicago" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pageCount">Page Count</Label>
          <Input id="pageCount" name="pageCount" type="number" placeholder="e.g., 100" />
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")}
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
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="synopsisFile">Supporting File (Optional)</Label>
        <Input id="synopsisFile" name="synopsisFile" type="file" disabled />
        <p className="text-xs text-muted-foreground">File uploads are under construction.</p>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="manuscriptFile">Manuscript/Synopsis (Optional)</Label>
        <Input id="manuscriptFile" name="manuscriptFile" type="file" disabled />
        <p className="text-xs text-muted-foreground">File uploads are under construction.</p>
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
          <CardDescription>Fields marked with * are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input id="title" name="title" placeholder="A concise title for your project" />
              <FormMessage />
            </div>

            {service === 'thesis-dissertation' && renderThesisForm()}
            {(service === 'research-paper' || service === 'review-paper') && renderPaperForm()}
            {service === 'book-writing' && renderBookWritingForm()}
            {(service === 'research-publication' || service === 'book-publishing') && renderPaperForm()}

            <div className="flex justify-end pt-4">
               <Button size="lg" type="button" className="w-full sm:w-auto">
                Submit Project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
