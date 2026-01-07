
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import type { Project, UserProfile } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import { doc, serverTimestamp, Timestamp, addDoc, collection, updateDoc, writeBatch } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const AssignTaskSchema = z.object({
  assignedTo: z.string().min(1, 'Please select a writer.'),
  description: z.string().min(1, 'Task description is required.'),
  dueDate: z.string().optional(),
});

type AssignTaskForm = z.infer<typeof AssignTaskSchema>;

export function AssignWriterDialog({ children, project, writers, onTaskCreated }: { children: React.ReactNode, project: Project, writers: UserProfile[], onTaskCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const firestore = useFirestore();

  const form = useForm<AssignTaskForm>({
    resolver: zodResolver(AssignTaskSchema),
    defaultValues: {
      assignedTo: '',
      description: `Write and complete the project: "${project.title}"`,
      dueDate: '',
    }
  });

  const onSubmit = async (data: AssignTaskForm) => {
    if (!project.id || !firestore) {
        setError('An unexpected error occurred. Missing required context.');
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const batch = writeBatch(firestore);

      // 1. Define the new task document
      const tasksCollection = collection(firestore, 'tasks');
      const taskDocRef = doc(tasksCollection); // Create a reference for the new task
      const taskData: any = {
        projectId: project.id,
        assignedTo: data.assignedTo,
        description: data.description,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (data.dueDate) {
        taskData.dueDate = Timestamp.fromDate(new Date(data.dueDate));
      }
      batch.set(taskDocRef, taskData);

      // 2. Define the update for the project document
      const projectDocRef = doc(firestore, 'projects', project.id);
      batch.update(projectDocRef, {
        assignedWriterId: data.assignedTo,
        status: 'in-progress'
      });

      // 3. Commit the batch
      await batch.commit();

      toast({
        title: 'Task Created!',
        description: `The project has been assigned and moved to 'In Progress'.`,
      });

      // Notify parent component that task is created
      onTaskCreated();
      
      form.reset();
      setOpen(false);

    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Assign Project: {project.title}</DialogTitle>
                <DialogDescription>Assign this project to a member of the writing team.</DialogDescription>
            </DialogHeader>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    
                    <FormField
                        control={form.control}
                        name="assignedTo"
                        render={({ field }) => (
                           <FormItem>
                            <FormLabel>Assign to Writer *</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a writer" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {writers.map(writer => (
                                      <SelectItem key={writer.uid} value={writer.uid}>{writer.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                     <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Task Description *</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Task details for the writer..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Due Date (Optional)</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" disabled={loading}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                             {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Assign Task
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}

    