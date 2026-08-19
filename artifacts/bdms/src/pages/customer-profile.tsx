import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { formatCurrency } from '@/data/mock';
import { format } from 'date-fns';
import { Mail, Phone, MapPin, Building2, User, FileText, Briefcase, Loader2 } from 'lucide-react';

export default function CustomerProfile() {
  const { id } = useParams();

  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.customers.list(),
  });

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => api.leads.list(),
  });

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.invoices.list(),
  });

  const isLoading = customersLoading || leadsLoading || invoicesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const customers = customersData?.customers ?? [];
  const leads = leadsData?.leads ?? [];
  const invoices = invoicesData?.invoices ?? [];

  const customer = customers.find(c => c.cidRef === id);

  if (!customer) {
    return <div className="p-8 text-center text-muted-foreground">Customer not found</div>;
  }

  if (customer.restricted) {
    return (
      <div className="mx-auto max-w-xl space-y-6 py-12 text-center">
        <Badge variant="outline" className="font-mono">{customer.cidRef}</Badge>
        <div>
          <h1 className="text-2xl font-bold">Customer details restricted</h1>
          <p className="mt-2 text-muted-foreground">
            Your technical role can use the customer ID for the related engineering work, but cannot view customer details.
          </p>
        </div>
      </div>
    );
  }

  const customerLeads = leads.filter(l => l.customerId === id);
  const customerInvoices = invoices.filter(i => i.customerId === id);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
            <Badge variant="outline" className="font-mono">{customer.cidRef}</Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              {customer.type === 'Business' ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
              {customer.type}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">Customer Profile & History</p>
        </div>
        <Button variant="outline">Edit Customer</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.location && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{customer.location}</span>
              </div>
            )}
            <div className="pt-4 border-t mt-4">
              <div className="text-xs text-muted-foreground mb-1">Source BDO</div>
              <Link href={`/bdo/${customer.sourceBdoId}`} className="font-mono text-sm text-primary hover:underline">{customer.sourceBdoId}</Link>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Projects</div>
                <div className="text-3xl font-bold">{customer.projectCount ?? 0}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Leads</div>
                <div className="text-3xl font-bold">{customer.leadCount ?? 0}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-2xl font-bold text-primary">{formatCurrency(customer.totalValue ?? 0)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2"><Briefcase className="h-4 w-4" /> Associated Leads</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead ID</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerLeads.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground text-sm">No leads recorded.</TableCell></TableRow>
                ) : (
                  customerLeads.map(lead => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-mono text-xs"><Link href={`/leads/${lead.leadRef}`} className="text-primary hover:underline">{lead.leadRef}</Link></TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{lead.stage}</Badge></TableCell>
                      <TableCell className="text-right">{lead.value > 0 ? formatCurrency(lead.value) : '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerInvoices.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground text-sm">No invoices recorded.</TableCell></TableRow>
                ) : (
                  customerInvoices.map(inv => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs"><Link href={`/invoicing/${inv.invoiceRef}`} className="text-primary hover:underline">{inv.invoiceRef}</Link></TableCell>
                      <TableCell><Badge className={inv.status === 'Paid' ? 'bg-green-600' : 'bg-amber-600'} variant="outline">{inv.status}</Badge></TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(inv.total)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
