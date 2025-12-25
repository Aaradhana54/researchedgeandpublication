'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
        description: 'For thesis, dissertations, research papers, and book writing.',
        icon: <Edit className="w-10 h-10 text-primary" />,
        href: '/dashboard/projects/create/writing',
    },
    {
        name: 'Publication',
        description: 'For journal research publication and book publishing services.',
        icon: <Book className="w-10 h-10 text-primary" />,
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
            <DialogContent className="sm:max-w-[825px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Create a New Project</DialogTitle>
                    <DialogDescription>
                        What type of service are you looking for? Select a category to continue.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-8 md:grid-cols-2 pt-4">
                    {serviceCategories.map((category) => (
                         <div
                            key={category.name}
                            onClick={() => handleSelect(category.href)}
                            className="cursor-pointer"
                        >
                            <Card className="h-full shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300 group">
                                <CardHeader className="flex-row items-center gap-4">
                                    {category.icon}
                                    <div>
                                        <CardTitle className="text-2xl">{category.name}</CardTitle>
                                        <CardDescription>{category.description}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-end text-sm font-medium text-primary group-hover:underline">
                                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
