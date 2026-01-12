
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Project, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, ArrowLeft, Edit } from 'lucide-react';
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
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EditSalesCommissionDialog } from '@/components/admin/edit-sales-commission-dialog';

const getProjectStatusVariant = (status?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'approved': return 'default';
      case 'in-progress': return 'secondary';
      case 'completed': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'outline';
      default: return 'outline';
    }
};

export default function SalespersonDetailPage() {
  const params = useParams();
  const salespersonId = params.id as string;
  const firestore = useFirestore();

  const [salesperson, setSalesperson] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!firestore || !salespersonId) return;

    setLoading(true);
    try {
      const userDocRef = doc(firestore, 'users', salespersonId);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        notFound();
        return;
      }
      const salespersonData = { ...userSnap.data() as UserProfile, uid: userSnap.id };
      setSalesperson(salespersonData);

      const projectsQuery = query(collection(firestore, 'projects'), where('finalizedBy', '==', salespersonId));
      const projectsSnap = await getDocs(projectsQuery);
      const projectsData = projectsSnap.docs.map(d => ({ ...d.data() as Project, id: d.id }));
      setProjects(projectsData);
      
    } catch (error) {
      console.error("Failed to fetch salesperson details and projects:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [firestore, salespersonId]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 -ml-4">
            <Link href="/admin/sales">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sales Performance
            </Link>
        </Button>
        {loading ? (
            <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
        ) : salesperson ? (
            <div>
                 <h1 className="text-3xl font-bold tracking-tight break-words">{salesperson.name}'s Deals</h1>
                 <p className="text-muted-foreground">A list of all projects finalized by {salesperson.name}.</p>
            </div>
        ) : (
             <h1 className="text-3xl font-bold tracking-tight text-destructive">Salesperson Not Found</h1>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Finalized Projects</CardTitle>
          <CardDescription>
            All projects finalized by this salesperson.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : projects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Deal Value</TableHead>
                  <TableHead>Sales Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Finalized</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium break-words">
                        <Link href={`/admin/projects/${project.id}`} className="hover:underline text-primary">
                            {project.title}
                        </Link>
                    </TableCell>
                    <TableCell>
                      {project.dealAmount ? project.dealAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{project.salesCommissionAmount ? project.salesCommissionAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : 'N/A'}</span>
                        <EditSalesCommissionDialog project={project} onCommissionUpdated={fetchData}>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </EditSalesCommissionDialog>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getProjectStatusVariant(project.status)} className="capitalize">
                        {project.status || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {project.finalizedAt ? format(project.finalizedAt.toDate(), 'PPP') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-12 text-muted-foreground">
              <h3 className="text-lg font-semibold">No Projects Found</h3>
              <p>This salesperson has not finalized any projects yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
