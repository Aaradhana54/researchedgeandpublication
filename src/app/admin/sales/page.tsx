import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SalesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
        <p className="text-muted-foreground">Monitor sales and revenue.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sales Data</CardTitle>
          <CardDescription>This section is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Sales charts and reports will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
