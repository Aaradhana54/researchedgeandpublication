
'use client';

import { useMemo } from 'react';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { Feedback, FeedbackStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Star, MoreHorizontal, Check, X, Inbox } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const getStatusVariant = (status: FeedbackStatus) => {
    switch (status) {
        case 'approved': return 'default';
        case 'rejected': return 'destructive';
        case 'pending': return 'secondary';
        default: return 'outline';
    }
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
            ))}
        </div>
    );
}

export default function FeedbackPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const feedbackQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'feedbacks'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: allFeedback, loading } = useCollection<Feedback>(feedbackQuery);

  const handleStatusChange = async (feedbackId: string, status: FeedbackStatus) => {
    if (!firestore) return;

    try {
        const feedbackRef = doc(firestore, 'feedbacks', feedbackId);
        await updateDoc(feedbackRef, { status });
        toast({
            title: "Feedback Updated",
            description: `The feedback has been ${status}.`
        });
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message,
        });
    }
  };

  const filteredFeedback = useMemo(() => {
    if (!allFeedback) {
        return { pending: [], approved: [], rejected: [] };
    }
    return {
        pending: allFeedback.filter(f => f.status === 'pending'),
        approved: allFeedback.filter(f => f.status === 'approved'),
        rejected: allFeedback.filter(f => f.status === 'rejected'),
    }
  }, [allFeedback]);
  
  const FeedbackTable = ({ feedbackItems }: { feedbackItems: Feedback[] }) => (
     <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Author</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {feedbackItems.map((fb) => (
          <TableRow key={fb.id}>
            <TableCell>
                <div className="font-medium">{fb.name}</div>
                <div className="text-sm text-muted-foreground">{fb.designation}</div>
            </TableCell>
             <TableCell>
                <StarRating rating={fb.rating} />
            </TableCell>
             <TableCell>
                <p className="max-w-xs truncate">{fb.message}</p>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(fb.status)} className="capitalize">{fb.status}</Badge>
            </TableCell>
            <TableCell>
              {fb.createdAt ? format(fb.createdAt.toDate(), 'PPP') : 'N/A'}
            </TableCell>
            <TableCell className="text-right">
              {fb.status === 'pending' && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusChange(fb.id!, 'approved')}>
                            <Check className="mr-2 h-4 w-4 text-green-500"/>
                            Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(fb.id!, 'rejected')}>
                            <X className="mr-2 h-4 w-4 text-red-500"/>
                            Reject
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Feedback & Testimonials</h1>
        <p className="text-muted-foreground">Manage and approve client feedback for testimonials.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Feedback Submissions</CardTitle>
          <CardDescription>
            Review new feedback and manage approved or rejected submissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                 <div className="flex justify-center items-center h-48">
                    <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
                </div>
            ): (
                 <Tabs defaultValue="pending">
                    <TabsList>
                        <TabsTrigger value="pending">Pending ({filteredFeedback.pending.length})</TabsTrigger>
                        <TabsTrigger value="approved">Approved ({filteredFeedback.approved.length})</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected ({filteredFeedback.rejected.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending">
                        {filteredFeedback.pending.length > 0 ? <FeedbackTable feedbackItems={filteredFeedback.pending} /> : (
                            <div className="text-center p-12 text-muted-foreground">
                                <Inbox className="mx-auto w-12 h-12 mb-4" />
                                <h3 className="text-lg font-semibold">No Pending Feedback</h3>
                                <p>There are no new feedback submissions to review.</p>
                            </div>
                        )}
                    </TabsContent>
                     <TabsContent value="approved">
                        {filteredFeedback.approved.length > 0 ? <FeedbackTable feedbackItems={filteredFeedback.approved} /> : (
                             <div className="text-center p-12 text-muted-foreground">
                                <Inbox className="mx-auto w-12 h-12 mb-4" />
                                <h3 className="text-lg font-semibold">No Approved Feedback</h3>
                                <p>There are no approved submissions yet.</p>
                            </div>
                        )}
                    </TabsContent>
                     <TabsContent value="rejected">
                        {filteredFeedback.rejected.length > 0 ? <FeedbackTable feedbackItems={filteredFeedback.rejected} /> : (
                             <div className="text-center p-12 text-muted-foreground">
                                <Inbox className="mx-auto w-12 h-12 mb-4" />
                                <h3 className="text-lg font-semibold">No Rejected Feedback</h3>
                                <p>There are no rejected submissions.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
