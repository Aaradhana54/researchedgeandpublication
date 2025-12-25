import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
        <p className="text-muted-foreground">Manage financial accounts and settings.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Accounting</CardTitle>
          <CardDescription>This section is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Financial dashboards and settings will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
