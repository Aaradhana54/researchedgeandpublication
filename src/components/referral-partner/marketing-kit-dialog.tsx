'use client';

import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, File as FileIcon, Image as ImageIcon, FileText, LoaderCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { MarketingAsset } from '@/lib/types';


function AssetIcon({ fileType }: { fileType: string }) {
    if (fileType.startsWith('image/')) {
        return <ImageIcon className="w-5 h-5 text-primary" />;
    }
    if (fileType === 'application/pdf') {
        return <FileText className="w-5 h-5 text-primary" />;
    }
    return <FileIcon className="w-5 h-5 text-primary" />;
}


export function MarketingKitDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const firestore = useFirestore();

    const assetsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'marketing_assets'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: assets, loading } = useCollection<MarketingAsset>(assetsQuery);
    
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
                <div className="py-4 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-40"><LoaderCircle className="w-8 h-8 animate-spin text-primary"/></div>
                    ) : assets && assets.length > 0 ? (
                         <ul className="space-y-4">
                            {assets.map((asset, index) => (
                               <li key={asset.id}>
                                   <div className="flex items-start gap-4">
                                       <div className="p-2 bg-primary/10 rounded-md mt-1">
                                           <AssetIcon fileType={asset.fileType} />
                                       </div>
                                       <div className="flex-1">
                                           <h4 className="font-semibold">{asset.title}</h4>
                                           <p className="text-sm text-muted-foreground">{asset.description}</p>
                                       </div>
                                       <Button variant="outline" size="sm" asChild>
                                            <a href={asset.downloadUrl} target="_blank" rel="noopener noreferrer">
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </a>
                                       </Button>
                                   </div>
                                   {index < assets.length - 1 && <Separator className="mt-4" />}
                               </li>
                           ))}
                        </ul>
                    ) : (
                         <div className="text-center p-12 text-muted-foreground">
                            <FileIcon className="mx-auto w-12 h-12 mb-4" />
                            <h3 className="text-lg font-semibold">No Materials Available</h3>
                            <p>Marketing materials will be added soon. Please check back later.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
