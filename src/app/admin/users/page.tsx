import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserManagementPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage all client and admin users.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>This section is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>A table of all users will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
