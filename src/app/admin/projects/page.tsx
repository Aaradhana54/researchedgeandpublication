import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminProjectsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
        <p className="text-muted-foreground">View and manage all user projects.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>This section is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>A table of all projects will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
