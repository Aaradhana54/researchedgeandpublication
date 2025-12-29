
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy, writeBatch, doc } from 'firebase/firestore';
import type { Notification } from '@/lib/types';
import { LoaderCircle, BellOff, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function NotificationsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const notificationsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);

  const { data: notifications, loading } = useCollection<Notification>(notificationsQuery);
  const hasUnread = notifications?.some(n => !n.isRead) ?? false;

  const handleMarkAllAsRead = async () => {
    if (!firestore || !notifications || !hasUnread) return;

    try {
        const batch = writeBatch(firestore);
        notifications.forEach(notification => {
            if (!notification.isRead && notification.id) {
                const notifRef = doc(firestore, 'notifications', notification.id);
                batch.update(notifRef, { isRead: true });
            }
        });
        await batch.commit();
        toast({
            title: "All Caught Up!",
            description: "All notifications have been marked as read."
        });
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: "Error",
            description: "Could not mark notifications as read."
        });
        console.error(error);
    }
  }


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Manage and view system notifications.</p>
        </div>
        <Button variant="outline" onClick={handleMarkAllAsRead} disabled={!hasUnread}>
            Mark all as read
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>A log of all your recent notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex justify-center items-center h-48">
              <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <ul className="space-y-4">
                {notifications.map(notif => (
                    <li key={notif.id} className="flex items-start gap-4 p-4 rounded-lg border bg-background hover:bg-secondary/50">
                        <div className="p-2 bg-primary/10 rounded-full mt-1">
                            <Bell className={`w-5 h-5 ${notif.isRead ? 'text-muted-foreground' : 'text-primary'}`} />
                        </div>
                        <div className="flex-1">
                            <p className={notif.isRead ? 'text-muted-foreground' : 'font-medium'}>{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true })}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
          ) : (
             <div className="text-center p-12 text-muted-foreground">
                <BellOff className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Notifications</h3>
                <p>You have no notifications yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
