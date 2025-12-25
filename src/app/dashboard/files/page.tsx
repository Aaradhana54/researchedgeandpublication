'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FilesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Files & Deliverables</h1>
        <p className="text-muted-foreground">Access your project files and deliverables here.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
          <CardDescription>This section is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Your project files will appear here once they are available.</p>
        </CardContent>
      </Card>
    </div>
  );
}
