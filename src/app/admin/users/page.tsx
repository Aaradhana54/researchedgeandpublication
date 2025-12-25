'use client';

import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection } from '@/firebase';
import { firestore } from '@/firebase/client';
import type { UserProfile } from '@/lib/types';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CreateUserDialog } from '@/components/admin/create-user-dialog';

const roleVariantMap: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  admin: 'destructive',
  client: 'default',
  author: 'secondary',
  'team-member': 'secondary',
  'referral-partner': 'outline',
};

export default function UserManagementPage() {
  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, []);

  const { data: users, loading } = useCollection<UserProfile>(usersQuery);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage all client and admin users.</p>
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
          <CardTitle>All Users</CardTitle>
          <CardDescription>A list of all users in your system.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : users ? (
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
          ) : (
             <p className="text-center text-muted-foreground py-12">No users found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
