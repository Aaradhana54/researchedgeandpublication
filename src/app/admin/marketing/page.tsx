
'use client';

import { useState, useMemo, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  LoaderCircle,
  File as FileIcon,
  Trash2,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { useStorage, useFirestore, useCollection } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { addDoc, collection, serverTimestamp, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import type { MarketingAsset, MarketingAssetCategory } from '@/lib/types';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const assetCategories: { value: MarketingAssetCategory, label: string }[] = [
    { value: 'demo-thesis', label: 'Demo Thesis' },
    { value: 'demo-synopsis', label: 'Demo Synopsis' },
    { value: 'general-marketing', label: 'General Marketing' },
];

function AssetIcon({ fileType }: { fileType: string }) {
    if (fileType.startsWith('image/')) {
        return <ImageIcon className="w-6 h-6 text-muted-foreground" />;
    }
    if (fileType === 'application/pdf') {
        return <FileText className="w-6 h-6 text-muted-foreground" />;
    }
    return <FileIcon className="w-6 h-6 text-muted-foreground" />;
}

export default function MarketingAdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MarketingAssetCategory>('general-marketing');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const storage = useStorage();
  const firestore = useFirestore();

  const assetsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'marketing_assets'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: assets, loading: assetsLoading } = useCollection<MarketingAsset>(assetsQuery);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !title || !category) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide a title, category, and select a file to upload.',
      });
      return;
    }
    if (!storage || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firebase not initialized.'});
        return;
    }

    setUploading(true);
    setProgress(0);

    const storageRef = ref(storage, `marketing_assets/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog);
      },
      (error) => {
        console.error('Upload failed:', error);
        toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
        setUploading(false);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const assetsCollection = collection(firestore, 'marketing_assets');
          
          await addDoc(assetsCollection, {
            title,
            description,
            category,
            fileName: file.name,
            fileType: file.type,
            downloadUrl,
            createdAt: serverTimestamp(),
          });

          toast({ title: 'Upload Complete', description: 'Marketing asset has been successfully uploaded.' });
          
          // Reset form
          setFile(null);
          setTitle('');
          setDescription('');
          setCategory('general-marketing');

        } catch (error: any) {
            console.error('Failed to save asset metadata:', error);
             toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
        } finally {
            setUploading(false);
        }
      }
    );
  };
  
  const handleDelete = async (asset: MarketingAsset) => {
      if (!storage || !firestore || !asset.id) return;
      
      const fileRef = ref(storage, asset.downloadUrl);
      const docRef = doc(firestore, 'marketing_assets', asset.id);

      try {
          // Delete file from storage
          await deleteObject(fileRef);
          // Delete document from firestore
          await deleteDoc(docRef);
          toast({ title: 'Asset Deleted', description: `${asset.title} has been removed.` });
      } catch (error: any) {
           console.error('Failed to delete asset:', error);
           if (error.code === 'storage/object-not-found') {
                // If file doesn't exist in storage, just delete the doc
                await deleteDoc(docRef);
                toast({ title: 'Asset Deleted', description: 'File not found in storage, but database entry was removed.' });
           } else {
             toast({ variant: 'destructive', title: 'Delete Failed', description: error.message });
           }
      }

  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Marketing Kit Management</h1>
        <p className="text-muted-foreground">Upload and manage promotional assets for referral partners.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Upload New Asset</CardTitle>
              <CardDescription>Add a new file to the marketing kit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="asset-title">Asset Title</Label>
                <Input
                  id="asset-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Company Logo Pack"
                  disabled={uploading}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="asset-category">Category</Label>
                 <Select
                    value={category}
                    onValueChange={(value) => setCategory(value as MarketingAssetCategory)}
                    disabled={uploading}
                >
                    <SelectTrigger id="asset-category">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {assetCategories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset-desc">Description (Optional)</Label>
                <Textarea
                  id="asset-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Contains PNG and SVG logos"
                   disabled={uploading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset-file">File</Label>
                <Input id="asset-file" type="file" onChange={handleFileChange}  disabled={uploading} />
              </div>
              {uploading && (
                 <div className="space-y-2">
                    <Label>Upload Progress</Label>
                    <Progress value={progress} />
                 </div>
              )}
              <Button onClick={handleUpload} disabled={uploading || !file || !title} className="w-full">
                {uploading ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload Asset
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
            <Card className="shadow-soft">
                <CardHeader>
                    <CardTitle>Uploaded Assets</CardTitle>
                    <CardDescription>The following assets are available to all referral partners.</CardDescription>
                </CardHeader>
                <CardContent>
                    {assetsLoading ? (
                        <div className="flex justify-center items-center h-40"><LoaderCircle className="w-8 h-8 animate-spin text-primary"/></div>
                    ) : assets && assets.length > 0 ? (
                        <ul className="space-y-4">
                            {assets.map(asset => (
                                <li key={asset.id} className="flex items-center gap-4 p-3 border rounded-md bg-background hover:bg-secondary/50 transition-colors">
                                    <AssetIcon fileType={asset.fileType} />
                                    <div className="flex-1">
                                        <p className="font-medium">{asset.title}</p>
                                        <p className="text-sm text-muted-foreground">{asset.fileName} &bull; {asset.createdAt ? format(asset.createdAt.toDate(), 'PPP') : ''}</p>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0">
                                                <Trash2 className="w-4 h-4"/>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete the asset "{asset.title}" from storage and cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(asset)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-lg">
                            <FileIcon className="mx-auto w-12 h-12 mb-4" />
                            <h3 className="text-lg font-semibold">No Assets Uploaded</h3>
                            <p>Use the form on the left to upload your first marketing asset.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

    