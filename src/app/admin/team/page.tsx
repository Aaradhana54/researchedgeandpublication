

'use client';

import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, UserPlus, Briefcase, Trash2 } from 'lucide-react';
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
import { CreateUserDialog } from '@/components/admin/create-user-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { deleteUserAsAdmin } from '@/firebase/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


function TeamMemberTable({ users, onDelete }: { users: UserProfile[], onDelete: (user: UserProfile) => void }) {
    if (!users || users.length === 0) {
        return (
             <div className="text-center p-12 text-muted-foreground">
                <Briefcase className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Team Members Found</h3>
                <p>There are no users with this role yet.</p>
            </div>
        );
    }
    
    return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
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

export default function TeamManagementPage() {
  const firestore = useFirestore();
  const { user: currentUser, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const teamRoles = ['writing-team', 'sales-team', 'sales-manager'];

  const fetchTeamUsers = async () => {
      if (!firestore || !currentUser) return;
      setLoading(true);
      try {
          const q = query(collection(firestore, 'users'), where('role', 'in', teamRoles));
          const querySnapshot = await getDocs(q);
          const teamUsers = querySnapshot.docs.map(doc => ({...doc.data() as UserProfile, uid: doc.id}));
          setUsers(teamUsers);
      } catch (error) {
          console.error("Error fetching team users:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not load team members.' });
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    if (firestore && currentUser) {
      fetchTeamUsers();
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
        fetchTeamUsers();
    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: error.message || 'An unexpected error occurred while deleting the user.'
        });
    }
  }

  const filteredUsers = useMemo(() => {
    const grouped: Record<string, UserProfile[]> = {
        'writing-team': [],
        'sales-team': [],
        'sales-manager': [],
    };
    users.forEach(user => {
        if (teamRoles.includes(user.role)) {
            grouped[user.role].push(user);
        }
    });
    return grouped;
  }, [users]);

  const tabs = [
    { value: 'writing-team', label: 'Writing Team', data: filteredUsers['writing-team'] || [] },
    { value: 'sales-team', label: 'Sales Team', data: filteredUsers['sales-team'] || [] },
    { value: 'sales-manager', label: 'Sales Manager', data: filteredUsers['sales-manager'] || [] },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Manage all internal team members across different roles.</p>
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
            <CardTitle>Team Roles</CardTitle>
            <CardDescription>Select a team to view and manage members.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="writing-team" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 mb-6 h-auto flex-wrap">
                   {tabs.map(tab => (
                     <TabsTrigger key={tab.value} value={tab.value} className="flex-1 capitalize">{tab.label.replace('-', ' ')}</TabsTrigger>
                   ))}
                </TabsList>
                
                {loading || userLoading ? (
                     <div className="flex justify-center items-center h-48">
                        <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                       {tabs.map(tab => (
                         <TabsContent key={tab.value} value={tab.value}>
                            <TeamMemberTable users={tab.data} onDelete={handleDeleteUser} />
                        </TabsContent>
                       ))}
                    </>
                )}
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
