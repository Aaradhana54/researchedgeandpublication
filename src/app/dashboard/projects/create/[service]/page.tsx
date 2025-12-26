'use client';

export default function CreateProjectPage({ params }: { params: { service: string }}) {
  const pageTitle = params.service === 'writing' ? 'New Writing Project' : 'New Publication Project';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">{pageTitle}</h1>
        {/* The form will be built here based on your instructions. */}
    </div>
  );
}
