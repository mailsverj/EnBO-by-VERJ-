import { useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockCustomers, mockLeads, mockInvoices, formatCurrency } from '@/data/mock';
import { format } from 'date-fns';
import { Mail, Phone, MapPin, Building2, User, FileText, Briefcase } from 'lucide-react';

export default function CustomerProfile() {
  const { id } = useParams();
  const customer = mockCustomers.find(c => c.id === id);

  if (!customer) {
    return <div className="p-8 text-center text-muted-foreground">Customer not found</div>;
  }

  const customerLeads = mockLeads.filter(l => l.customerId === id);
  const customerInvoices = mockInvoices.filter(i => i.customerId === id);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
            <Badge variant="outline" className="font-mono">{customer.id}</Badge>
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
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{customer.location}</span>
            </div>
            <div className="pt-4 border-t mt-4">
              <div className="text-xs text-muted-foreground mb-1">Source BDO</div>
              <Link href={`/bdo/${customer.sourceBdo}`} className="font-mono text-sm text-primary hover:underline">{customer.sourceBdo}</Link>
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
                <div className="text-3xl font-bold">{customer.projectCount}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Leads</div>
                <div className="text-3xl font-bold">{customer.leadCount}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-2xl font-bold text-primary">{formatCurrency(customer.totalValue)}</div>
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
                      <TableCell className="font-mono text-xs"><Link href={`/leads/${lead.id}`} className="text-primary hover:underline">{lead.id}</Link></TableCell>
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
                      <TableCell className="font-mono text-xs"><Link href={`/invoicing/${inv.id}`} className="text-primary hover:underline">{inv.id}</Link></TableCell>
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
