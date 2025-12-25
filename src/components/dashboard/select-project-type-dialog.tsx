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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Book, Edit } from 'lucide-react';
import { Button } from '../ui/button';

const writingServices = [
    { name: 'Thesis & Dissertation', value: 'thesis-dissertation' },
    { name: 'Research Paper', value: 'research-paper' },
    { name: 'Book Writing', value: 'book-writing' },
    { name: 'Review Paper', value: 'review-paper' },
];

const publicationServices = [
    { name: 'Research Publication', value: 'research-publication' },
    { name: 'Book Publishing', value: 'book-publishing' },
];

const ServiceButton = ({ name, value, onSelect }: { name: string; value: string; onSelect: (value: string) => void }) => {
    return (
        <Button 
            variant="ghost" 
            className="w-full justify-start font-normal text-muted-foreground hover:text-primary"
            onClick={() => onSelect(value)}
        >
            {name}
        </Button>
    )
};


export function SelectProjectTypeDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleSelect = (serviceValue: string) => {
        const isWriting = writingServices.some(s => s.value === serviceValue);
        const category = isWriting ? 'writing' : 'publication';
        router.push(`/dashboard/projects/create/${category}?serviceType=${serviceValue}`);
        setOpen(false); // Close the dialog on selection
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Create a New Project</DialogTitle>
                    <DialogDescription>
                        Select a service to begin.
                    </DialogDescription>
                </DialogHeader>

                <Accordion type="multiple" className="w-full">
                    <AccordionItem value="writing">
                        <AccordionTrigger className="text-lg font-medium hover:no-underline">
                             <div className="flex items-center gap-3">
                                <Edit className="w-5 h-5 text-primary" />
                                <span>Writing</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-4">
                            {writingServices.map((service) => (
                                <ServiceButton key={service.value} name={service.name} value={service.value} onSelect={handleSelect} />
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="publication">
                        <AccordionTrigger className="text-lg font-medium hover:no-underline">
                             <div className="flex items-center gap-3">
                                <Book className="w-5 h-5 text-primary" />
                                <span>Publication</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-4">
                           {publicationServices.map((service) => (
                                <ServiceButton key={service.value} name={service.name} value={service.value} onSelect={handleSelect} />
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </DialogContent>
        </Dialog>
    );
}
