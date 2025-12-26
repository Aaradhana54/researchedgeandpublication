'use client';

import { useMemo, useState } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection } from '@/firebase';
import { firestore } from '@/firebase/client';
import type { UserProfile, UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, UserPlus } from 'lucide-react';
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

const roleVariantMap: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  admin: 'destructive',
  client: 'default',
  author: 'secondary',
  'referral-partner': 'outline',
  'writing-team': 'secondary',
  'sales-team': 'secondary',
  'publication-team': 'secondary',
  'accounts-team': 'secondary',
};

function UserTable({ users }: { users: UserProfile[] }) {
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
    );
}

const teamRoles: UserRole[] = [
  'admin',
  'writing-team',
  'sales-team',
  'publication-team',
  'accounts-team',
];

export default function UserManagementPage() {
  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, []);

  const { data: users, loading } = useCollection<UserProfile>(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!users) {
      return {
        clients: [],
        authors: [],
        team: [],
        partners: [],
      };
    }
    return {
      clients: users.filter(u => u.role === 'client'),
      authors: users.filter(u => u.role === 'author'),
      team: users.filter(u => teamRoles.includes(u.role)),
      partners: users.filter(u => u.role === 'referral-partner'),
    };
  }, [users]);
  
  const tabs = [
    { value: 'clients', label: 'Research Clients', data: filteredUsers.clients },
    { value: 'authors', label: 'Authors', data: filteredUsers.authors },
    { value: 'team', label: 'Team', data: filteredUsers.team },
    { value: 'partners', label: 'Referral Partners', data: filteredUsers.partners },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage all client, author, team, and partner users.</p>
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
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-4 mb-6">
                   {tabs.map(tab => (
                     <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
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
                                <UserTable users={tab.data} />
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
