import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PayoutsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Payout Approval</h1>
        <p className="text-muted-foreground">View pending payouts and approve them.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Payouts</CardTitle>
          <CardDescription>This section is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>A list of pending and completed payouts will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
