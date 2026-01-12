

'use client';

import { useMemo, useEffect, useState } from 'react';
import { collection, query, doc, deleteDoc, where, getDocs } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
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
                <TableCell className="font-medium break-words">{user.name}</TableCell>
                <TableCell className="break-all">{user.email}</TableCell>
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

export default function UserManagementPage() {
  const firestore = useFirestore();
  const { user: currentUser, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllUsers = async () => {
    if (!firestore || !currentUser) return;
    setLoading(true);
    try {
      const userRoles = ['client', 'author', 'admin'];
      const userPromises = userRoles.map(role => 
        getDocs(query(collection(firestore, 'users'), where('role', '==', role)))
      );
      const userSnapshots = await Promise.all(userPromises);
      
      const usersData = userSnapshots.flatMap(snapshot => 
        snapshot.docs.map(doc => ({ ...doc.data() as UserProfile, uid: doc.id }))
      );

      setAllUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load user data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firestore && currentUser) {
      fetchAllUsers();
    }
  }, [firestore, currentUser]);

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
        fetchAllUsers();
    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: error.message || 'An unexpected error occurred while deleting the user.'
        });
    }
  }

  const filteredUsers = useMemo(() => {
    return {
      clients: allUsers.filter(u => u.role === 'client'),
      authors: allUsers.filter(u => u.role === 'author'),
      admins: allUsers.filter(u => u.role === 'admin'),
    };
  }, [allUsers]);
  
  const tabs = [
    { value: 'clients', label: 'Research Clients', data: filteredUsers.clients },
    { value: 'authors', label: 'Authors', data: filteredUsers.authors },
    { value: 'admins', label: 'Admins', data: filteredUsers.admins },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage all client, author, and admin users.</p>
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
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 mb-6 h-auto flex-wrap">
                   {tabs.map(tab => (
                     <TabsTrigger key={tab.value} value={tab.value} className="flex-1">{tab.label}</TabsTrigger>
                   ))}
                </TabsList>
                
                {loading || userLoading ? (
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
