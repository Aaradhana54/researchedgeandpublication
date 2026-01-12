
'use client';

import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { UserProfile, Project } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import Link from 'next/link';

interface SalesPerformanceData {
  salesperson: UserProfile;
  dealsFinalized: number;
  totalDealValue: number;
}

export default function SalesPage() {
  const firestore = useFirestore();
  const [salesData, setSalesData] = useState<SalesPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    const fetchSalesData = async () => {
      setLoading(true);
      try {
        // 1. Fetch all projects that have been finalized (have a 'finalizedBy' field)
        const projectsQuery = query(
          collection(firestore, 'projects'),
          where('finalizedBy', '!=', null)
        );
        const projectsSnap = await getDocs(projectsQuery);
        
        const finalizedProjects = projectsSnap.docs
            .map(doc => doc.data() as Project)
            .filter(project => !!project.finalizedBy);

        if (finalizedProjects.length === 0) {
          setSalesData([]);
          setLoading(false);
          return;
        }

        // 2. Aggregate performance by salesperson ID
        const performanceMap = new Map<string, { deals: number; value: number }>();
        const salesPersonIds = new Set<string>();

        finalizedProjects.forEach(project => {
          if (project.finalizedBy) {
            salesPersonIds.add(project.finalizedBy);
            const current = performanceMap.get(project.finalizedBy) || { deals: 0, value: 0 };
            current.deals += 1;
            current.value += project.dealAmount || 0;
            performanceMap.set(project.finalizedBy, current);
          }
        });

        // 3. Fetch the specific user profiles for the salespeople
        const usersMap = new Map<string, UserProfile>();
        const idsArray = Array.from(salesPersonIds);
        
        if (idsArray.length > 0) {
            for (let i = 0; i < idsArray.length; i += 30) {
                const chunk = idsArray.slice(i, i + 30);
                const usersQuery = query(collection(firestore, 'users'), where('__name__', 'in', chunk));
                const usersSnap = await getDocs(usersQuery);
                usersSnap.forEach(doc => {
                    usersMap.set(doc.id, { ...doc.data() as UserProfile, uid: doc.id });
                });
            }
        }
        
        // 4. Combine data for display
        const finalPerformanceData = Array.from(performanceMap.entries()).map(([userId, perf]) => ({
          salesperson: usersMap.get(userId)!,
          dealsFinalized: perf.deals,
          totalDealValue: perf.value,
        })).filter(item => item.salesperson); 

        finalPerformanceData.sort((a, b) => b.totalDealValue - a.totalDealValue);
        
        setSalesData(finalPerformanceData);

      } catch (error) {
        console.error("Error fetching sales data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [firestore]);


  const grandTotal = useMemo(() => {
    return salesData.reduce((acc, current) => acc + current.totalDealValue, 0);
  }, [salesData]);

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
          ) : salesData && salesData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Salesperson</TableHead>
                  <TableHead>Deals Finalized</TableHead>
                  <TableHead className="text-right">Total Deal Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.map(({ salesperson, dealsFinalized, totalDealValue }) => (
                  <TableRow key={salesperson.uid}>
                    <TableCell className="font-medium">
                        <Link href={`/admin/sales/${salesperson.uid}`} className="hover:underline text-primary">
                            <div className="font-medium break-words">{salesperson.name}</div>
                            <div className="text-sm text-muted-foreground break-all">{salesperson.email}</div>
                        </Link>
                    </TableCell>
                    <TableCell className="text-center font-medium">{dealsFinalized}</TableCell>
                    <TableCell className="text-right font-medium">
                      {totalDealValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
               <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="font-bold text-lg">Grand Total</TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {grandTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                  </TableCell>
                </TableRow>
              </TableFooter>
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
