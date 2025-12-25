import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign } from "lucide-react";

export default function PaymentsPage() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <CircleDollarSign className="w-8 h-8 text-primary" />
                    <CardTitle className="text-2xl font-bold">Payments & Invoices</CardTitle>
                </div>
                <CardDescription>
                    View your payment history and download invoices.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This section is under construction. Your payment information will be displayed here soon.</p>
            </CardContent>
        </Card>
    )
}
