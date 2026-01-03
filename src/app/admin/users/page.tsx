

'use client';

import { useMemo } from 'react';
import { collection, query, doc, deleteDoc, where } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, UserPlus, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CreateUserDialog } from '@/components/admin/create-user-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteUserAsAdmin } from '@/firebase/auth';

const roleVariantMap: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  admin: 'destructive',
  client: 'default',
  author: 'secondary',
  'referral-partner': 'outline',
  'writing-team': 'secondary',
  'sales-team': 'secondary',
  'sales-manager': 'secondary',
  'publication-team': 'secondary',
  'accounts-team': 'secondary',
};

function UserTable({ users, onDelete }: { users: UserProfile[], onDelete: (user: UserProfile) => void }) {
    if (!users || users.length === 0) {
        return <p className="text-center text-muted-foreground py-12">No users found for this role.</p>;
    }
    
    return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uid}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={roleVariantMap[user.role] || 'default'} className="capitalize">
                    {user.role.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                    {user.createdAt ? format(user.createdAt.toDate(), 'PPP') : 'N/A'}
                </TableCell>
                 <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" disabled={user.role === 'admin'}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will permanently delete the user account for <strong>{user.name}</strong> ({user.email}). This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(user)} className="bg-destructive hover:bg-destructive/90">Delete User</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    );
}

function ReferralPartnerTable({ partners, allUsers, onDelete }: { partners: UserProfile[], allUsers: UserProfile[], onDelete: (user: UserProfile) => void }) {
    if (!partners || partners.length === 0) {
        return <p className="text-center text-muted-foreground py-12">No referral partners found.</p>;
    }

    const referralCounts = useMemo(() => {
        const counts = new Map<string, number>();
        if (!allUsers || !partners) return counts;

        partners.forEach(partner => {
            if(partner.referralCode) {
                const count = allUsers.filter(u => u.referredBy === partner.referralCode).length;
                counts.set(partner.uid, count);
            }
        });
        return counts;
    }, [partners, allUsers]);

    return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Partner Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Referral Code</TableHead>
              <TableHead>Referred Clients</TableHead>
              <TableHead>Joined On</TableHead>
               <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.map((partner) => (
              <TableRow key={partner.uid}>
                <TableCell className="font-medium">{partner.name}</TableCell>
                <TableCell>{partner.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{partner.referralCode}</Badge>
                </TableCell>
                 <TableCell className="font-medium">{referralCounts.get(partner.uid) || 0}</TableCell>
                <TableCell>
                    {partner.createdAt ? format(partner.createdAt.toDate(), 'PPP') : 'N/A'}
                </TableCell>
                 <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
                           <AlertDialogDescription>
                            This action will permanently delete the user account for <strong>{partner.name}</strong> ({partner.email}). This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(partner)} className="bg-destructive hover:bg-destructive/90">Delete User</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    );
}


export default function UserManagementPage() {
  const firestore = useFirestore();
  const { user: currentUser, loading: userLoading } = useUser();
  const { toast } = useToast();

  // The query is now dependent on the currentUser being loaded.
  const usersQuery = useMemo(() => {
    if (!firestore || !currentUser) return null;
    return query(collection(firestore, 'users'));
  }, [firestore, currentUser]);

  const { data: users, loading: usersLoading } = useCollection<UserProfile>(usersQuery);
  const loading = userLoading || usersLoading;

  const handleDeleteUser = async (userToDelete: UserProfile) => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
        return;
    }
    
    if (userToDelete.role === 'admin') {
      toast({
        variant: 'destructive',
        title: 'Action Not Allowed',
        description: 'Admin users cannot be deleted from the dashboard for security reasons.',
      });
      return;
    }

    try {
        await deleteUserAsAdmin(userToDelete.uid);
        toast({
            title: 'User Deleted',
            description: `The account for ${userToDelete.name} has been permanently deleted.`
        });
        // The useCollection hook should update automatically
    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: error.message || 'An unexpected error occurred while deleting the user.'
        });
    }
  }


  const filteredUsers = useMemo(() => {
    if (!users) {
      return {
        clients: [],
        authors: [],
        partners: [],
        admins: [],
      };
    }
    return {
      clients: users.filter(u => u.role === 'client'),
      authors: users.filter(u => u.role === 'author'),
      partners: users.filter(u => u.role === 'referral-partner'),
      admins: users.filter(u => u.role === 'admin'),
    };
  }, [users]);
  
  const tabs = [
    { value: 'clients', label: 'Research Clients', data: filteredUsers.clients },
    { value: 'authors', label: 'Authors', data: filteredUsers.authors },
    { value: 'partners', label: 'Referral Partners', data: filteredUsers.partners },
    { value: 'admins', label: 'Admins', data: filteredUsers.admins },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage all client, author, partner, and admin users.</p>
        </div>
        <CreateUserDialog>
            <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
            </Button>
        </CreateUserDialog>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>User Roles</CardTitle>
            <CardDescription>Select a role to view and manage users.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="clients">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 mb-6 h-auto flex-wrap">
                   {tabs.map(tab => (
                     <TabsTrigger key={tab.value} value={tab.value} className="flex-1">{tab.label}</TabsTrigger>
                   ))}
                </TabsList>
                
                {loading ? (
                     <div className="flex justify-center items-center h-48">
                        <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <TabsContent value="clients">
                            <UserTable users={filteredUsers.clients} onDelete={handleDeleteUser} />
                        </TabsContent>
                         <TabsContent value="authors">
                            <UserTable users={filteredUsers.authors} onDelete={handleDeleteUser} />
                        </TabsContent>
                         <TabsContent value="partners">
                            <ReferralPartnerTable partners={filteredUsers.partners} allUsers={users || []} onDelete={handleDeleteUser} />
                        </TabsContent>
                         <TabsContent value="admins">
                            <UserTable users={filteredUsers.admins} onDelete={handleDeleteUser}/>
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

