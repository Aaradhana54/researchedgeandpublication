'use client';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PenTool, TrendingUp, BookCheck, Banknote, ArrowRight } from 'lucide-react';

const teams = [
  {
    href: '/admin/team/writing',
    label: 'Writing Team',
    icon: <PenTool className="w-8 h-8 text-primary" />,
    description: 'Manage all writers and editors.',
  },
  {
    href: '/admin/team/sales',
    label: 'Sales Team',
    icon: <TrendingUp className="w-8 h-8 text-primary" />,
    description: 'View members of the sales department.',
  },
  {
    href: '/admin/team/publication',
    label: 'Publication Team',
    icon: <BookCheck className="w-8 h-8 text-primary" />,
    description: 'Manage the publication and outreach staff.',
  },
  {
    href: '/admin/team/accounts',
    label: 'Accounts Team',
    icon: <Banknote className="w-8 h-8 text-primary" />,
    description: 'Oversee the financial and accounting staff.',
  },
];

export default function TeamManagementPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground">Select a team to view its members.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teams.map((team) => (
          <Link href={team.href} key={team.href} className="group">
            <Card className="h-full shadow-soft hover:shadow-lift transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="flex justify-between items-center">
                   {team.icon}
                   <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="pt-4 text-xl">{team.label}</CardTitle>
                <CardDescription>{team.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
