
'use client';

import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, UserPlus, Briefcase } from 'lucide-react';
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


function TeamMemberTable({ users }: { users: UserProfile[] }) {
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uid}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                    {user.createdAt ? format(user.createdAt.toDate(), 'PPP') : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    );
}

export default function TeamManagementPage() {
  const firestore = useFirestore();

  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, [firestore]);

  const { data: users, loading } = useCollection<UserProfile>(usersQuery);

  const teamRoles = ['writing-team', 'sales-team', 'sales-manager', 'publication-team', 'accounts-team'];

  const filteredUsers = useMemo(() => {
    if (!users) {
        const initial: Record<string, UserProfile[]> = {};
        teamRoles.forEach(role => initial[role] = []);
        return initial;
    }
    const grouped = users.reduce((acc, user) => {
      if (teamRoles.includes(user.role)) {
        if (!acc[user.role]) {
          acc[user.role] = [];
        }
        acc[user.role].push(user);
      }
      return acc;
    }, {} as Record<string, UserProfile[]>);

     teamRoles.forEach(role => {
        if (!grouped[role]) {
          grouped[role] = [];
        }
    });

    return grouped;
  }, [users]);

  const tabs = [
    { value: 'writing-team', label: 'Writing Team', data: filteredUsers['writing-team'] },
    { value: 'sales-team', label: 'Sales Team', data: filteredUsers['sales-team'] },
    { value: 'sales-manager', label: 'Sales Manager', data: filteredUsers['sales-manager'] },
    { value: 'publication-team', label: 'Publication Team', data: filteredUsers['publication-team'] },
    { value: 'accounts-team', label: 'Accounts Team', data: filteredUsers['accounts-team'] },
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
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-6 h-auto flex-wrap">
                   {tabs.map(tab => (
                     <TabsTrigger key={tab.value} value={tab.value} className="flex-1 capitalize">{tab.label.replace('-', ' ')}</TabsTrigger>
                   ))}
                </TabsList>
                
                {loading ? (
                     <div className="flex justify-center items-center h-48">
                        <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                       {tabs.map(tab => (
                         <TabsContent key={tab.value} value={tab.value}>
                            <TeamMemberTable users={tab.data} />
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
