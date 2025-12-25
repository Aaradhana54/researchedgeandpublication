'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCollection } from '@/firebase';
import { createProject } from '@/firebase/firestore';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';

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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoaderCircle, PlusCircle, FolderKanban, PenSquare, BookUp, ArrowLeft } from 'lucide-react';
import { type Project, type ProjectServiceType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


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
});

type ProjectFormValues = z.infer<typeof projectSchema>;

type ServiceCategory = 'writing' | 'publication';

const serviceCategories: Record<
  ServiceCategory,
  { label: string; services: Record<string, string> }
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
      'book-publishing': 'Book Publication',
    },
  },
};

const serviceTypeLabels: Record<ProjectServiceType, string> = {
  ...serviceCategories.writing.services,
  ...serviceCategories.publication.services,
} as Record<ProjectServiceType, string>;


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
    },
  });

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
    form.reset();
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
      await createProject(userId, data.title, data.serviceType as ProjectServiceType);
      toast({
        title: 'Project Created!',
        description: 'Your new project has been successfully created.',
      });
      form.reset();
      handleOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: 'Could not create the project. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentTitle = 
    step === 1 ? 'Create a New Project' 
  : step === 2 ? `Select a ${selectedCategory === 'writing' ? 'Writing' : 'Publication'} Service`
  : `Finalize Your Project`;

  const currentDescription = 
    step === 1 ? 'What kind of project are you starting?' 
  : step === 2 ? 'Choose the specific service you need.'
  : 'Please give your project a title to get started.';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
          <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create a New Project
          </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
           {step > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4 h-7 w-7"
              onClick={() => setStep(step - 1)}
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
              className="flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors group"
              onClick={() => handleCategorySelect('writing')}
            >
                <PenSquare className="w-10 h-10 mb-2 text-primary group-hover:text-accent-foreground" />
                <h3 className="font-semibold">{serviceCategories.writing.label}</h3>
            </Card>
            <Card
              className="flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors group"
              onClick={() => handleCategorySelect('publication')}
            >
                <BookUp className="w-10 h-10 mb-2 text-primary group-hover:text-accent-foreground" />
                <h3 className="font-semibold">{serviceCategories.publication.label}</h3>
            </Card>
          </div>
        )}
        
        {step === 2 && selectedCategory && (
            <div className="grid grid-cols-1 gap-3 py-4">
                {Object.entries(serviceCategories[selectedCategory].services).map(([value, label]) => (
                     <Card
                        key={value}
                        className="flex items-center justify-center p-4 text-center cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors group h-16"
                        onClick={() => handleServiceSelect(value as ProjectServiceType)}
                     >
                         <h3 className="font-semibold text-sm">{label}</h3>
                     </Card>
                ))}
            </div>
        )}

        {step === 3 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
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
              <DialogFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                  Create Project
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProjectCard({ project }: { project: Project }) {
  // Find the label for the serviceType, checking both categories.
  const label = serviceTypeLabels[project.serviceType] || project.serviceType;
  
  return (
    <Card className="shadow-soft hover:shadow-lift transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-primary text-xl">{project.title}</CardTitle>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Placeholder for more project details */}
        <div className="text-sm text-muted-foreground">
          Status: <span className="font-medium text-foreground capitalize">{project.status}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
          <div className="bg-accent h-2.5 rounded-full" style={{ width: `${project.progressPercent}%` }}></div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProjectList({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const { user } = useUser();
  
  const projectsQuery = firestore ? query(collection(firestore, 'projects'), where('userId', '==', userId)) : null;

  const { data: projects, loading, error } = useCollection<Project>(projectsQuery);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Could not load your projects. Please try again later.
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
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
