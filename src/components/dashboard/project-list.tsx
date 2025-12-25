'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCollection } from '@/firebase';
import { createProject } from '@/firebase/firestore';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoaderCircle, PlusCircle, FolderKanban } from 'lucide-react';
import { type Project, type ProjectServiceType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const projectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  serviceType: z.enum([
    'thesis',
    'dissertation',
    'data-analysis',
    'paper',
    'book',
    'institutional',
  ]),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const serviceTypeLabels: Record<ProjectServiceType, string> = {
  thesis: 'Thesis/Dissertation',
  dissertation: 'Dissertation',
  'data-analysis': 'Data Analysis',
  paper: 'Research Paper',
  book: 'Book Publishing',
  institutional: 'Institutional Branding',
};

function CreateProjectDialog({ userId, asHero = false }: { userId: string, asHero?: boolean }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
    },
  });

  const onSubmit = async (data: ProjectFormValues) => {
    setIsLoading(true);
    try {
      await createProject(userId, data.title, data.serviceType as ProjectServiceType);
      toast({
        title: 'Project Created!',
        description: 'Your new project has been successfully created.',
      });
      form.reset();
      setOpen(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {asHero ? (
           <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Your First Project
            </Button>
        ) : (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Project</DialogTitle>
          <DialogDescription>
            Fill in the details below to get started with a new research project.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(serviceTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="shadow-soft hover:shadow-lift transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-primary text-xl">{project.title}</CardTitle>
        <CardDescription>{serviceTypeLabels[project.serviceType]}</CardDescription>
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
      <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg bg-card">
        <FolderKanban className="mx-auto h-16 w-16 text-muted-foreground" />
        <h3 className="mt-6 text-xl font-semibold text-foreground">No Projects Found</h3>
        <p className="mt-2 text-md text-muted-foreground">
          It looks like you haven't started any projects yet.
        </p>
        <div className="mt-8">
          <CreateProjectDialog userId={userId} asHero={true} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
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
