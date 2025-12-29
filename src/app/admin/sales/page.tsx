
'use client';

import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { UserProfile, Project } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, DollarSign, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SalesPerformanceData {
  salesperson: UserProfile;
  dealsFinalized: number;
  totalDealValue: number;
}

export default function SalesPage() {
  const firestore = useFirestore();

  const salesTeamQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'sales-team'));
  }, [firestore]);

  const finalizedProjectsQuery = useMemo(() => {
    if (!firestore) return null;
    // We fetch all projects that are past the 'pending' state, as they would have a finalizer.
    return query(collection(firestore, 'projects'), where('status', 'in', ['approved', 'in-progress', 'completed']));
  }, [firestore]);

  const { data: salesTeam, loading: loadingSales } = useCollection<UserProfile>(salesTeamQuery);
  const { data: projects, loading: loadingProjects } = useCollection<Project>(finalizedProjectsQuery);

  const loading = loadingSales || loadingProjects;

  const performanceData = useMemo(() => {
    if (!salesTeam || !projects) return [];

    const performanceMap = new Map<string, { deals: number; value: number }>();

    projects.forEach(project => {
      if (project.finalizedBy) {
        const current = performanceMap.get(project.finalizedBy) || { deals: 0, value: 0 };
        current.deals += 1;
        current.value += project.dealAmount || 0;
        performanceMap.set(project.finalizedBy, current);
      }
    });

    return salesTeam.map(salesperson => ({
      salesperson,
      dealsFinalized: performanceMap.get(salesperson.uid)?.deals || 0,
      totalDealValue: performanceMap.get(salesperson.uid)?.value || 0,
    })).sort((a,b) => b.totalDealValue - a.totalDealValue); // Sort by highest value

  }, [salesTeam, projects]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Sales Performance</h1>
        <p className="text-muted-foreground">Monitor sales team contributions and finalized deals.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Team Contributions</CardTitle>
          <CardDescription>A breakdown of deals finalized by each member of the sales team.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : performanceData && performanceData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Salesperson</TableHead>
                  <TableHead>Deals Finalized</TableHead>
                  <TableHead className="text-right">Total Deal Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceData.map(({ salesperson, dealsFinalized, totalDealValue }) => (
                  <TableRow key={salesperson.uid}>
                    <TableCell className="font-medium">
                        <div className="font-medium">{salesperson.name}</div>
                        <div className="text-sm text-muted-foreground">{salesperson.email}</div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{dealsFinalized}</TableCell>
                    <TableCell className="text-right font-medium">
                      {totalDealValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-12 text-muted-foreground">
                <Users className="mx-auto w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">No Sales Data Available</h3>
                <p>There are no sales team members or no finalized deals to display yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
