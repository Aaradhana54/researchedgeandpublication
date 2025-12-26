
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, Image, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const marketingAssets = [
    {
        icon: <Image className="w-5 h-5 text-primary" />,
        title: 'Logo Pack & Brand Guidelines',
        description: 'High-resolution logos in various formats (PNG, SVG) and our brand style guide.',
        downloadLink: '#',
    },
    {
        icon: <FileText className="w-5 h-5 text-primary" />,
        title: 'Social Media Creatives',
        description: 'A collection of ready-to-use banners and posts for Facebook, Instagram, and LinkedIn.',
        downloadLink: '#',
    },
    {
        icon: <Mail className="w-5 h-5 text-primary" />,
        title: 'Email Templates',
        description: 'Professionally written email templates to send to your network and potential clients.',
        downloadLink: '#',
    }
];

export function MarketingKitDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Marketing Kit</DialogTitle>
                    <DialogDescription>
                        Downloadable assets to help you promote our services and increase your referrals.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <ul className="space-y-4">
                       {marketingAssets.map((asset, index) => (
                           <li key={asset.title}>
                               <div className="flex items-start gap-4">
                                   <div className="p-2 bg-primary/10 rounded-md mt-1">
                                       {asset.icon}
                                   </div>
                                   <div className="flex-1">
                                       <h4 className="font-semibold">{asset.title}</h4>
                                       <p className="text-sm text-muted-foreground">{asset.description}</p>
                                   </div>
                                   <Button variant="outline" size="sm" asChild>
                                        <a href={asset.downloadLink} download>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </a>
                                   </Button>
                               </div>
                               {index < marketingAssets.length - 1 && <Separator className="mt-4" />}
                           </li>
                       ))}
                    </ul>
                </div>
            </DialogContent>
        </Dialog>
    );
}
