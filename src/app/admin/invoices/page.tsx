import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InvoicesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Invoices & Reports</h1>
        <p className="text-muted-foreground">Auto-generate invoices and download reports.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>This section is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>A list of generated invoices and reporting tools will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
