
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingKitDialog } from '@/components/referral-partner/marketing-kit-dialog';
import { Button } from '@/components/ui/button';
import { Paintbrush } from 'lucide-react';

export default function MarketingPage() {
    return (
         <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Marketing Kit</h1>
                <p className="text-muted-foreground">Assets to help you promote our services.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Promotional Materials</CardTitle>
                    <CardDescription>Download logos, creatives, and templates to share with your network.</CardDescription>
                </CardHeader>
                <CardContent>
                    <MarketingKitDialog>
                        <Button><Paintbrush className="mr-2"/> Access Materials</Button>
                    </MarketingKitDialog>
                    <p className="text-xs text-muted-foreground mt-4">Click the button to open the marketing kit and view all downloadable assets.</p>
                </CardContent>
            </Card>
        </div>
    );
}
