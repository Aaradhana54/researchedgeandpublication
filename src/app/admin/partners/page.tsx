

'use client';

import { useMemo, useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { UserProfile, Project } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Trash2, Edit, UserPlus, Handshake } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteUserAsAdmin } from '@/firebase/auth';
import { EditPartnerDialog } from '@/components/admin/edit-partner-dialog';
import { CreateUserDialog } from '@/components/admin/create-user-dialog';
import Link from 'next/link';

export default function PartnerManagementPage() {
  const firestore = useFirestore();
  const { user: currentUser, loading: userLoading } = useUser();
  const { toast } = useToast();
  
  const [partners, setPartners] = useState<UserProfile[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]); // For referred user lookups
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!firestore || !currentUser) return;
    setLoading(true);
    try {
      const partnersQuery = query(collection(firestore, 'users'), where('role', '==', 'referral-partner'));
      const projectsQuery = query(collection(firestore, 'projects'));
      
      const [partnersSnapshot, projectsSnapshot] = await Promise.all([
        getDocs(partnersQuery),
        getDocs(projectsQuery)
      ]);

      const partnersData = partnersSnapshot.docs.map(doc => ({ ...doc.data() as UserProfile, uid: doc.id }));
      const projectsData = projectsSnapshot.docs.map(doc => ({ ...doc.data() as Project, id: doc.id }));
      
      setPartners(partnersData);
      setAllProjects(projectsData);
      
      const referralCodes = partnersData.map(p => p.referralCode).filter(Boolean) as string[];
      if(referralCodes.length > 0) {
        const fetchedReferredUsers: UserProfile[] = [];
        for (let i = 0; i < referralCodes.length; i += 30) {
            const chunk = referralCodes.slice(i, i + 30);
            const referredUsersQuery = query(collection(firestore, 'users'), where('referredBy', 'in', chunk));
            const referredUsersSnap = await getDocs(referredUsersQuery);
            referredUsersSnap.forEach(doc => {
              fetchedReferredUsers.push({ ...doc.data() as UserProfile, uid: doc.id });
            });
        }
        setAllUsers(fetchedReferredUsers);
      }

    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load partner data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firestore && currentUser) {
      fetchData();
    }
  }, [firestore, currentUser]);

  const handleDeleteUser = async (userToDelete: UserProfile) => {
    try {
        await deleteUserAsAdmin(userToDelete.uid);
        toast({
            title: 'User Deleted',
            description: `The account for ${userToDelete.name} has been permanently deleted.`
        });
        fetchData();
    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: error.message || 'An unexpected error occurred while deleting the user.'
        });
    }
  }

  const partnerStats = useMemo(() => {
    const stats = new Map<string, { referred: number, converted: number }>();
    if (!partners.length) return stats;

    partners.forEach(partner => {
      const referredUsers = allUsers.filter(u => u.referredBy === partner.referralCode).map(u => u.uid);
      const convertedProjects = allProjects.filter(p => (referredUsers.includes(p.userId) || p.referredByPartnerId === partner.uid) && ['approved', 'in-progress', 'completed'].includes(p.status || ''));
      
      stats.set(partner.uid, {
        referred: referredUsers.length,
        converted: convertedProjects.length
      });
    });
    return stats;
  }, [partners, allUsers, allProjects]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Partner Management</h1>
          <p className="text-muted-foreground">View partner performance and manage commissions.</p>
        </div>
        <CreateUserDialog>
            <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Partner
            </Button>
        </CreateUserDialog>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Referral Partners</CardTitle>
            <CardDescription>A list of all registered referral partners.</CardDescription>
        </CardHeader>
        <CardContent>
           {loading || userLoading ? (
                 <div className="flex justify-center items-center h-48">
                    <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : partners.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Partner Name</TableHead>
                        <TableHead>Default Commission</TableHead>
                        <TableHead>Referred</TableHead>
                        <TableHead>Converted</TableHead>
                        <TableHead>Joined On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {partners.map((partner) => {
                            const stats = partnerStats.get(partner.uid);
                            return (
                                <TableRow key={partner.uid}>
                                <TableCell className="font-medium">
                                  <Link href={`/admin/partners/${partner.uid}`} className="hover:underline text-primary">
                                    {partner.name}
                                  </Link>
                                </TableCell>
                                <TableCell>{partner.commissionRate ? partner.commissionRate.toLocaleString('en-IN', { style: 'currency', currency: 'INR'}) : 'Not Set'}</TableCell>
                                <TableCell className="text-center font-medium">{stats?.referred || 0}</TableCell>
                                <TableCell className="text-center font-medium">{stats?.converted || 0}</TableCell>
                                <TableCell>
                                    {partner.createdAt ? format(partner.createdAt.toDate(), 'PPP') : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <EditPartnerDialog partner={partner} onPartnerUpdated={fetchData}>
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </EditPartnerDialog>
                                        <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure you want to delete this partner?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action will permanently delete the user account for <strong>{partner.name}</strong> ({partner.email}). This cannot be undone.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteUser(partner)} className="bg-destructive hover:bg-destructive/90">Delete Partner</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Handshake className="mx-auto w-12 h-12 mb-4" />
                    <h3 className="text-lg font-semibold">No Referral Partners Found</h3>
                    <p>Use the "Create Partner" button to add the first one.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
