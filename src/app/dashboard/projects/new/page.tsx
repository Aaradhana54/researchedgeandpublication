'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Book, Edit } from 'lucide-react';
import Link from 'next/link';

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

export default function NewProjectPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Create a New Project</h1>
                <p className="text-muted-foreground">
                    What type of service are you looking for?
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {serviceCategories.map((category) => (
                    <Link href={category.href} key={category.name}>
                        <Card className="h-full shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
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
                    </Link>
                ))}
            </div>
        </div>
    );
}
