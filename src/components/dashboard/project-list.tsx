
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCollection, useUser } from '@/firebase';
import { createProject } from '@/firebase/firestore';
import { uploadFileAndGetURL } from '@/firebase/storage';
import { collection, query, where } from 'firebase/firestore';
import { firestore } from '@/firebase/client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoaderCircle, PlusCircle, FolderKanban, PenSquare, BookUp, ArrowLeft, CalendarIcon, Upload, CheckCircle, Clock } from 'lucide-react';
import { type Project, type ProjectServiceType, type CourseLevel } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';


const fileSchema = z.instanceof(File).optional().refine(file => !file || file.size <= 5 * 1024 * 1024, 'File size must be 5MB or less.');

const projectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  serviceType: z.enum([
    'thesis-dissertation',
    'research-paper',
    'book-writing',
    'review-paper',
    'research-publication',
    'book-publishing',
  ]),
  topic: z.string().optional(),
  courseLevel: z.enum(['ug', 'pg', 'phd']).optional(),
  deadline: z.date().optional(),
  referencingStyle: z.string().optional(),
  pageCount: z.coerce.number().positive('Must be a positive number.').optional(),
  wordCount: z.coerce.number().positive('Must be a positive number.').optional(),
  language: z.string().optional(),
  wantToPublish: z.boolean().optional(),
  publishWhere: z.string().optional(),
  synopsisFile: fileSchema,
});

type ProjectFormValues = z.infer<typeof projectSchema>;

type ServiceCategory = 'writing' | 'publication';

const serviceCategories: Record<
  ServiceCategory,
  { label: string; services: Record<Partial<ProjectServiceType>, string> }
> = {
  writing: {
    label: 'Writing & Research',
    services: {
      'thesis-dissertation': 'Thesis/Dissertation Writing',
      'research-paper': 'Research Paper Writing',
      'book-writing': 'Book Writing',
      'review-paper': 'Review Paper Writing',
    },
  },
  publication: {
    label: 'Book & Publishing',
    services: {
      'research-publication': 'Research Publication',
      'book-publishing': 'Book Publishing',
    },
  },
};

const serviceTypeLabels: Record<ProjectServiceType, string> = {
  'thesis-dissertation': 'Thesis/Dissertation Writing',
  'research-paper': 'Research Paper Writing',
  'book-writing': 'Book Writing',
  'review-paper': 'Review Paper Writing',
  'research-publication': 'Research Publication',
  'book-publishing': 'Book Publishing',
};


export function CreateProjectDialog({ userId }: { userId: string}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const { toast } = useToast();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      topic: '',
      referencingStyle: '',
      language: 'English',
      wantToPublish: false,
      publishWhere: '',
      wordCount: undefined,
      pageCount: undefined,
      courseLevel: undefined,
      deadline: undefined,
      synopsisFile: undefined,
    },
  });
  
  const wantToPublishValue = form.watch('wantToPublish');

  const handleCategorySelect = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setStep(2);
  };
  
  const handleServiceSelect = (service: ProjectServiceType) => {
    form.setValue('serviceType', service);
    setStep(3);
  }

  const resetDialog = () => {
    setStep(1);
    setSelectedCategory(null);
    form.reset({
      title: '',
      topic: '',
      referencingStyle: '',
      language: 'English',
      wantToPublish: false,
      publishWhere: '',
      wordCount: undefined,
      pageCount: undefined,
      courseLevel: undefined,
      deadline: undefined,
      synopsisFile: undefined,
    });
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(resetDialog, 300);
    }
  }

  const onSubmit = async (data: ProjectFormValues) => {
    setIsLoading(true);
    try {
      let synopsisFileUrl: string | undefined = undefined;
      const { synopsisFile, ...projectData } = data;

      if (synopsisFile) {
        toast({ title: 'Uploading file...', description: 'Please wait.' });
        synopsisFileUrl = await uploadFileAndGetURL(userId, synopsisFile);
      }

      await createProject(userId, { ...projectData, synopsisFileUrl });
      
      toast({
        title: 'Project Created!',
        description: 'Your new project has been successfully created.',
      });
      handleOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: 'Could not create the project. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentServiceType = form.watch('serviceType');

  const currentTitle = 
    step === 1 ? 'Create a New Project' 
  : step === 2 ? `Select a ${selectedCategory === 'writing' ? 'Writing' : 'Publication'} Service`
  : `Finalize Your Project`;

  const currentDescription = 
    step === 1 ? 'What kind of project are you starting?' 
  : step === 2 ? 'Choose the specific service you need.'
  : 'Please provide the details for your new project.';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
          <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create a New Project
          </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
           {step > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4 h-7 w-7"
              onClick={() => step === 3 ? setStep(2) : (setStep(1), setSelectedCategory(null))}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <DialogTitle className="text-center">
            {currentTitle}
          </DialogTitle>
          <DialogDescription className="text-center">
            {currentDescription}
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
             <Card
              className="flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors group h-32"
              onClick={() => handleCategorySelect('writing')}
            >
                <PenSquare className="w-10 h-10 mb-2 text-primary group-hover:text-accent-foreground" />
                <h3 className="font-semibold">{serviceCategories.writing.label}</h3>
            </Card>
            <Card
              className="flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors group h-32"
              onClick={() => handleCategorySelect('publication')}
            >
                <BookUp className="w-10 h-10 mb-2 text-primary group-hover:text-accent-foreground" />
                <h3 className="font-semibold">{serviceCategories.publication.label}</h3>
            </Card>
          </div>
        )}
        
        {step === 2 && selectedCategory && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {Object.entries(serviceCategories[selectedCategory].services).map(([value, label]) => (
                     <Card
                        key={value}
                        className="flex items-center justify-center p-4 text-center cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors group h-24"
                        onClick={() => handleServiceSelect(value as ProjectServiceType)}
                     >
                         <h3 className="font-semibold text-base">{label}</h3>
                     </Card>
                ))}
            </div>
        )}

        {step === 3 && (
          <ScrollArea className="max-h-[60vh] -mx-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 pb-6">
                <div className='space-y-1 text-center bg-muted/50 p-3 rounded-md'>
                      <p className='text-sm text-muted-foreground'>Selected Service</p>
                      <p className='font-semibold text-primary'>{serviceTypeLabels[form.getValues('serviceType')]}</p>
                </div>

                  <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Project Title</FormLabel>
                          <FormControl>
                          <Input placeholder="e.g., My Doctoral Thesis" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                
                {currentServiceType === 'thesis-dissertation' && (
                  <>
                      <FormField control={form.control} name="topic" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Topic</FormLabel>
                              <FormControl><Input placeholder="Your research topic" {...field} value={field.value || ''} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />

                      <FormField control={form.control} name="courseLevel" render={({ field }) => (
                          <FormItem className="space-y-3">
                              <FormLabel>Level of Course</FormLabel>
                              <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                      <FormItem className="flex items-center space-x-2 space-y-0">
                                          <FormControl><RadioGroupItem value="ug" /></FormControl>
                                          <FormLabel className="font-normal">UG</FormLabel>
                                      </FormItem>
                                      <FormItem className="flex items-center space-x-2 space-y-0">
                                          <FormControl><RadioGroupItem value="pg" /></FormControl>
                                          <FormLabel className="font-normal">PG</FormLabel>
                                      </FormItem>
                                      <FormItem className="flex items-center space-x-2 space-y-0">
                                          <FormControl><RadioGroupItem value="phd" /></FormControl>
                                          <FormLabel className="font-normal">PhD</FormLabel>
                                      </FormItem>
                                  </RadioGroup>
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="deadline"
                          render={({ field }) => {
                            const [openCal, setOpenCal] = useState(false);

                            return (
                              <FormItem className="flex flex-col">
                                <FormLabel>Deadline</FormLabel>
                                <Popover open={openCal} onOpenChange={setOpenCal} modal>
                                  <PopoverTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className={cn(
                                        "justify-between font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? format(field.value, "PPP") : "Pick a date"}
                                      <CalendarIcon className="h-4 w-4 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={(date) => {
                                        if (!date) return;
                                        field.onChange(date);
                                        setOpenCal(false); // close after pick
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />

                          <FormField control={form.control} name="pageCount" render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Page Count (Approx.)</FormLabel>
                                  <FormControl><Input type="number" placeholder="e.g., 250" {...field} value={field.value || ''} /></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField control={form.control} name="referencingStyle" render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Referencing Style</FormLabel>
                                  <FormControl><Input placeholder="e.g., APA 7th Ed." {...field} value={field.value || ''} /></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                          
                          <FormField control={form.control} name="language" render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Language</FormLabel>
                                  <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="synopsisFile"
                        render={({ field: { onChange, value, ...rest } }) => (
                          <FormItem>
                            <FormLabel>Synopsis File (Optional)</FormLabel>
                            <FormControl>
                               <Input 
                                type="file" 
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => onChange(e.target.files?.[0])}
                                {...rest} 
                               />
                            </FormControl>
                             <FormDescription>Upload your synopsis or proposal document (PDF/Word, max 5MB).</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </>
                )}
                
                {(currentServiceType === 'research-paper' || currentServiceType === 'review-paper') && (
                  <>
                      <FormField control={form.control} name="topic" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Topic</FormLabel>
                              <FormControl><Input placeholder="Your research topic" {...field} value={field.value || ''} /></FormControl>
                              <FormMessage />
                          </FormItem>
                      )} />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField control={form.control} name="wordCount" render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Word Count (Approx.)</FormLabel>
                                  <FormControl><Input type="number" placeholder="e.g., 5000" {...field} value={field.value || ''} /></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />

                          <FormField control={form.control} name="language" render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Language</FormLabel>
                                  <FormControl><Input {...field} value={field.value || ''}/></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="courseLevel" render={({ field }) => (
                              <FormItem className="space-y-3">
                                  <FormLabel>Level</FormLabel>
                                  <FormControl>
                                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                          <FormItem className="flex items-center space-x-2 space-y-0">
                                              <FormControl><RadioGroupItem value="ug" /></FormControl>
                                              <FormLabel className="font-normal">UG</FormLabel>
                                          </FormItem>
                                          <FormItem className="flex items-center space-x-2 space-y-0">
                                              <FormControl><RadioGroupItem value="pg" /></FormControl>
                                              <FormLabel className="font-normal">PG</FormLabel>
                                          </FormItem>
                                          <FormItem className="flex items-center space-x-2 space-y-0">
                                              <FormControl><RadioGroupItem value="phd" /></FormControl>
                                              <FormLabel className="font-normal">PhD</FormLabel>
                                          </FormItem>
                                      </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />

                        <FormField
                          control={form.control}
                          name="deadline"
                          render={({ field }) => {
                            const [openCal, setOpenCal] = useState(false);

                            return (
                              <FormItem className="flex flex-col">
                                <FormLabel>Deadline</FormLabel>
                                <Popover open={openCal} onOpenChange={setOpenCal} modal>
                                  <PopoverTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className={cn(
                                        "justify-between font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? format(field.value, "PPP") : "Pick a date"}
                                      <CalendarIcon className="h-4 w-4 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={(date) => {
                                        if (!date) return;
                                        field.onChange(date);
                                        setOpenCal(false); // close after pick
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="synopsisFile"
                        render={({ field: { onChange, value, ...rest } }) => (
                          <FormItem>
                            <FormLabel>Relevant File (Optional)</FormLabel>
                             <FormControl>
                               <Input 
                                type="file" 
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => onChange(e.target.files?.[0])}
                                {...rest} 
                               />
                            </FormControl>
                             <FormDescription>Upload your draft or requirements (PDF/Word, max 5MB).</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                          <FormField
                              control={form.control}
                              name="wantToPublish"
                              render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                  <FormControl>
                                      <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                      />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                      <FormLabel>
                                          Do you want to publish this paper?
                                      </FormLabel>
                                      <FormDescription>
                                        Check this box if you require publication support.
                                      </FormDescription>
                                  </div>
                                  </FormItem>
                              )}
                          />

                          {wantToPublishValue && (
                              <FormField
                                  control={form.control}
                                  name="publishWhere"
                                  render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Where do you want to publish?</FormLabel>
                                      <FormControl>
                                      <Input placeholder="e.g., Scopus, SCI, a specific journal name" {...field} value={field.value || ''} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                                  )}
                              />
                          )}
                      </div>
                  </>
                )}

                {(currentServiceType === 'book-writing' || currentServiceType === 'book-publishing') && (
                  <>
                    <FormField control={form.control} name="topic" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Topic / Title of the Book</FormLabel>
                            <FormControl><Input placeholder="Your book's topic or working title" {...field} value={field.value || ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="pageCount" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Page Count (Approx.)</FormLabel>
                                <FormControl><Input type="number" placeholder="e.g., 150" {...field} value={field.value || ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="language" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Language</FormLabel>
                                <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                     <FormField
                          control={form.control}
                          name="deadline"
                          render={({ field }) => {
                            const [openCal, setOpenCal] = useState(false);

                            return (
                              <FormItem className="flex flex-col">
                                <FormLabel>Expected Deadline</FormLabel>
                                <Popover open={openCal} onOpenChange={setOpenCal} modal>
                                  <PopoverTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className={cn(
                                        "justify-between font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? format(field.value, "PPP") : "Pick a date"}
                                      <CalendarIcon className="h-4 w-4 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={(date) => {
                                        if (!date) return;
                                        field.onChange(date);
                                        setOpenCal(false); // close after pick
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />


                     <FormField
                        control={form.control}
                        name="wantToPublish"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Want to publish this book with us?
                                </FormLabel>
                                <FormDescription>
                                    We offer full publishing and distribution services.
                                </FormDescription>
                            </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="synopsisFile"
                        render={({ field: { onChange, value, ...rest } }) => (
                          <FormItem>
                            <FormLabel>Manuscript / Voice Notes (Optional)</FormLabel>
                             <FormControl>
                               <Input 
                                type="file" 
                                accept=".pdf,.doc,.docx,.mp3,.wav,.m4a"
                                onChange={(e) => onChange(e.target.files?.[0])}
                                {...rest} 
                               />
                            </FormControl>
                             <FormDescription>Upload your manuscript or voice recording (PDF, Word, Audio, max 5MB).</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </>
                )}


                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Create Project
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const label = serviceTypeLabels[project.serviceType] || project.serviceType;
  
  const badgeVariant = project.approved ? 'default' : 'secondary';
  const badgeText = project.approved ? 'Approved' : 'Pending Approval';
  const BadgeIcon = project.approved ? CheckCircle : Clock;
  
  return (
    <Card className="shadow-soft hover:shadow-lift transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-primary text-xl">{project.title}</CardTitle>
          <Badge 
            variant={badgeVariant}
            className={cn(
              project.approved ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200',
              'dark:bg-opacity-20'
            )}
          >
            <BadgeIcon className="mr-1 h-3 w-3" />
            {badgeText}
          </Badge>
        </div>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Status: <span className="font-medium text-foreground capitalize">{project.status}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 dark:bg-muted">
          <div className="bg-accent h-2.5 rounded-full" style={{ width: `${project.progressPercent || 0}%` }}></div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProjectList({ userId }: { userId: string }) {
  const { user } = useUser();
  
  const projectsQuery = useMemo(() => {
    if (!firestore || !userId) return null;
    return query(collection(firestore, 'projects'), where('userId', '==', userId));
  }, [userId]);

  const { data: projects, loading, error } = useCollection<Project>(projectsQuery);

  if (loading || !projectsQuery) {
    return (
      <div className="flex justify-center py-16">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Loading Projects</AlertTitle>
        <AlertDescription>
          {error.message.includes('permission-denied') || error.message.includes('insufficient permissions')
            ? 'You do not have permission to view these projects. Please check your security rules.'
            : 'Could not load your projects. Please try again later.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg bg-card mt-8">
        <FolderKanban className="mx-auto h-16 w-16 text-muted-foreground" />
        <h3 className="mt-6 text-xl font-semibold text-foreground">No Projects Found</h3>
        <p className="mt-2 text-md text-muted-foreground">
          Welcome, {user?.displayName || 'Client'}! Get started by creating your first project.
        </p>
        <div className="mt-8">
          <CreateProjectDialog userId={userId} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight">My Projects</h2>
        <CreateProjectDialog userId={userId} />
      </div>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

    
