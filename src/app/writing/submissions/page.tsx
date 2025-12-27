
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SubmissionsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Submissions</h1>
        <p className="text-muted-foreground">Submit your completed work and view submission history.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>File Submissions</CardTitle>
          <CardDescription>This section is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>The functionality to upload and track file submissions will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
