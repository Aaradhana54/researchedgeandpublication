'use client';

import { useParams } from 'next/navigation';

export default function CreateProjectPage() {
  const params = useParams();
  const service = params.service as string;
  const pageTitle = service === 'writing' ? 'New Writing Project' : 'New Publication Project';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">{pageTitle}</h1>
        {/* The form will be built here based on your instructions. */}
    </div>
  );
}
