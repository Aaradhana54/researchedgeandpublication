'use client';

import { useUser } from '@/firebase';
import { ProjectList } from '@/components/dashboard/project-list';
import { LoaderCircle } from 'lucide-react';

export default function MyProjectsPage() {
    const { user, loading } = useUser();

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <ProjectList userId={user.uid} />
    )
}
