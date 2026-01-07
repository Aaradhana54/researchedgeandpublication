
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
import { EditCommissionDialog } from '@/components/admin/edit-commission-dialog';

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

export default function PartnerDetailPage() {
  const params = useParams();
  const partnerId = params.id as string;
  const firestore = useFirestore();

  const [partner, setPartner] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, UserProfile>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!firestore || !partnerId) return;

    setLoading(true);
    try {
      // Fetch partner details
      const partnerDocRef = doc(firestore, 'users', partnerId);
      const partnerSnap = await getDoc(partnerDocRef);
      if (!partnerSnap.exists()) {
        notFound();
        return;
      }
      const partnerData = { ...partnerSnap.data() as UserProfile, uid: partnerSnap.id };
      setPartner(partnerData);

      // Fetch all projects related to this partner
      const referredUserQuery = query(collection(firestore, 'users'), where('referredBy', '==', partnerData.referralCode));
      const directLeadProjectsQuery = query(collection(firestore, 'projects'), where('referredByPartnerId', '==', partnerId));

      const referredUserSnap = await getDocs(referredUserQuery);
      const referredUserIds = referredUserSnap.docs.map(d => d.id);
      
      const queries = [getDocs(directLeadProjectsQuery)];
      if (referredUserIds.length > 0) {
          queries.push(getDocs(query(collection(firestore, 'projects'), where('userId', 'in', referredUserIds))));
      }

      const projectSnapshots = await Promise.all(queries);
      const allProjects = new Map<string, Project>();
      projectSnapshots.forEach(snap => {
          snap.forEach(d => {
              if (!allProjects.has(d.id)) {
                  allProjects.set(d.id, { ...d.data() as Project, id: d.id });
              }
          })
      });
      
      const projectsData = Array.from(allProjects.values());
      setProjects(projectsData);
      
      // Fetch client details for the projects
      const clientIds = new Set(projectsData.map(p => p.userId).filter(id => !id.startsWith('unregistered_')));
      if (clientIds.size > 0) {
          const clientsQuery = query(collection(firestore, 'users'), where('__name__', 'in', Array.from(clientIds)));
          const clientsSnap = await getDocs(clientsQuery);
          const newUsersMap = new Map();
          clientsSnap.forEach(clientDoc => {
              newUsersMap.set(clientDoc.id, { ...clientDoc.data() as UserProfile, uid: clientDoc.id });
          });
          setUsersMap(newUsersMap);
      }

    } catch (error) {
      console.error("Failed to fetch partner details and projects:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [firestore, partnerId]);

  const getClientName = (project: Project) => {
    if (project.userId.startsWith('unregistered_')) {
        return project.userId.split('_')[1]; // Email
    }
    return usersMap.get(project.userId)?.name || 'Unknown Client';
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 -ml-4">
            <Link href="/admin/partners">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Partners
            </Link>
        </Button>
        {loading ? (
            <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
        ) : partner ? (
            <div>
                 <h1 className="text-3xl font-bold tracking-tight">{partner.name}'s Referrals</h1>
                 <p className="text-muted-foreground">A list of all projects referred by {partner.name}.</p>
            </div>
        ) : (
             <h1 className="text-3xl font-bold tracking-tight text-destructive">Partner Not Found</h1>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Referred Projects</CardTitle>
          <CardDescription>
            All projects sourced from this partner, either through sign-up code or direct lead submission.
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
                  <TableHead>Client</TableHead>
                  <TableHead>Deal Value</TableHead>
                  <TableHead>Commission Earned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Finalized</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                        <Link href={`/admin/projects/${project.id}`} className="hover:underline text-primary">
                            {project.title}
                        </Link>
                    </TableCell>
                    <TableCell>{getClientName(project)}</TableCell>
                    <TableCell>
                      {project.dealAmount ? project.dealAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{project.commissionAmount ? project.commissionAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : 'N/A'}</span>
                        <EditCommissionDialog project={project} onCommissionUpdated={fetchData}>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </EditCommissionDialog>
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
              <p>This partner has not referred any projects yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
