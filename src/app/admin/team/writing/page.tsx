'use client';

import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase';
import { firestore } from '@/firebase/client';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, UserPlus, PenTool } from 'lucide-react';
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

function UserTable({ users }: { users: UserProfile[] }) {
    if (!users || users.length === 0) {
        return (
             <div className="text-center p-12 text-muted-foreground">
                <PenTool className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Writing Team Members</h3>
                <p>You can add members to the writing team from the User Management page.</p>
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

export default function WritingTeamPage() {
  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'writing-team'));
  }, []);

  const { data: users, loading } = useCollection<UserProfile>(usersQuery);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Writing Team</h1>
          <p className="text-muted-foreground">Manage all members of the writing team.</p>
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
            <CardTitle>All Writing Team Members</CardTitle>
            <CardDescription>A list of all users with the 'Writing Team' role.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                 <div className="flex justify-center items-center h-48">
                    <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <UserTable users={users || []} />
            )}
        </CardContent>
      </Card>
    </div>
  );
}
