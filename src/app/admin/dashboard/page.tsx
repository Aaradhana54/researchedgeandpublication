import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  UploadCloud,
  DollarSign,
  CheckCircle,
  FileText,
  Mail,
  FilePenLine,
} from 'lucide-react';

const features = [
  {
    icon: <Users className="h-5 w-5 text-primary" />,
    text: 'Manage all users (clients, authors, partners)',
  },
  {
    icon: <UploadCloud className="h-5 w-5 text-primary" />,
    text: 'Upload updates & deliverables',
  },
  {
    icon: <DollarSign className="h-5 w-5 text-primary" />,
    text: 'Add or update book sales data',
  },
  {
    icon: <CheckCircle className="h-5 w-5 text-primary" />,
    text: 'Approve payouts',
  },
  {
    icon: <FileText className="h-5 w-5 text-primary" />,
    text: 'Generate automated invoices & reports',
  },
  {
    icon: <Mail className="h-5 w-5 text-primary" />,
    text: 'Send notifications and emails',
  },
  {
    icon: <FilePenLine className="h-5 w-5 text-primary" />,
    text: 'Assign tasks to writers or editors',
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Your internal team login for full control.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>
            Full control over your application's data and operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {features.map((feature) => (
              <li key={feature.text} className="flex items-center gap-4">
                <div className="flex-shrink-0">{feature.icon}</div>
                <span className="text-muted-foreground">{feature.text}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
