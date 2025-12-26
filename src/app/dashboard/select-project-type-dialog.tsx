'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Book, Edit, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import type { ProjectServiceType } from '@/lib/types';

const writingServices: { name: string, value: ProjectServiceType }[] = [
    { name: 'Thesis & Dissertation', value: 'thesis-dissertation' },
    { name: 'Research Paper', value: 'research-paper' },
    { name: 'Book Writing', value: 'book-writing' },
    { name: 'Review Paper', value: 'review-paper' },
];

const publicationServices: { name: string, value: ProjectServiceType }[] = [
    { name: 'Research Publication', value: 'research-publication' },
    { name: 'Book Publishing', value: 'book-publishing' },
];


export function SelectProjectTypeDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<'main' | 'writing' | 'publication'>('main');
    const router = useRouter();

    const handleServiceSelect = (serviceValue: ProjectServiceType) => {
        router.push(`/dashboard/projects/create/${serviceValue}`);
        setOpen(false);
        // Reset view for next time dialog is opened
        setTimeout(() => setView('main'), 300); 
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            // Reset view when dialog is closed
            setTimeout(() => setView('main'), 300);
        }
    }
    
    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    {view !== 'main' && (
                        <Button variant="ghost" size="sm" className="absolute left-4 top-4 w-auto h-auto p-2" onClick={() => setView('main')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    )}
                    <DialogTitle className={cn("text-xl font-bold", view !== 'main' && 'text-center')}>
                       {view === 'main' && 'Create a New Project'}
                       {view === 'writing' && 'Writing Services'}
                       {view === 'publication' && 'Publication Services'}
                    </DialogTitle>
                    <DialogDescription className={cn(view !== 'main' && 'text-center')}>
                        Select a service to begin.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    {view === 'main' && (
                        <>
                            <Button variant="outline" className="w-full h-16 text-lg" onClick={() => setView('writing')}>
                                <Edit className="w-5 h-5 mr-3" /> Writing
                            </Button>
                             <Button variant="outline" className="w-full h-16 text-lg" onClick={() => setView('publication')}>
                                <Book className="w-5 h-5 mr-3" /> Publication
                            </Button>
                        </>
                    )}

                    {view === 'writing' && (
                        <div className="flex flex-col gap-2">
                            {writingServices.map((service) => (
                                <Button key={service.value} variant="ghost" className="w-full justify-start" onClick={() => service.value === 'thesis-dissertation' ? handleServiceSelect(service.value) : undefined}>
                                    {service.name}
                                </Button>
                            ))}
                        </div>
                    )}
                    
                     {view === 'publication' && (
                        <div className="flex flex-col gap-2">
                           {publicationServices.map((service) => (
                                <Button key={service.value} variant="ghost" className="w-full justify-start" onClick={() => undefined}>
                                    {service.name}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
