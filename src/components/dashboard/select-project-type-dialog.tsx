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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Book, Edit } from 'lucide-react';

const serviceCategories = [
    {
        name: 'Writing',
        description: 'Thesis, research papers, etc.',
        icon: <Edit className="w-8 h-8 text-primary" />,
        href: '/dashboard/projects/create/writing',
    },
    {
        name: 'Publication',
        description: 'Journal and book publishing.',
        icon: <Book className="w-8 h-8 text-primary" />,
        href: '/dashboard/projects/create/publication',
    },
];

export function SelectProjectTypeDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleSelect = (href: string) => {
        router.push(href);
        setOpen(false);
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
                        Select a service category to begin.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 pt-4">
                    {serviceCategories.map((category) => (
                         <div
                            key={category.name}
                            onClick={() => handleSelect(category.href)}
                            className="group relative cursor-pointer overflow-hidden rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-all duration-300 hover:border-primary hover:shadow-lg"
                        >
                            <div className="flex items-center gap-4">
                                {category.icon}
                                <div>
                                    <h3 className="text-lg font-semibold">{category.name}</h3>
                                    <p className="text-sm text-muted-foreground">{category.description}</p>
                                </div>
                                <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
