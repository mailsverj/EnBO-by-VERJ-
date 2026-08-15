import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { formatCurrency } from '@/data/mock';
import { Search, Filter, Plus, FileSpreadsheet, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'wouter';

export default function Invoices() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.invoices.list(),
  });

  const invoices = data?.invoices ?? [];

  const filteredInvoices = invoices.filter(i =>
    i.customerName.toLowerCase().includes(search.toLowerCase()) ||
    i.invoiceRef.toLowerCase().includes(search.toLowerCase()) ||
    (i.sourceBdoId ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Pending Approval': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Issued': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage billing and payments.</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Create Invoice</Button>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices by ID, customer, or BDO..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Source BDO</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map(invoice => (
                      <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <TableCell className="font-mono text-xs font-semibold text-primary">
                          <Link href={`/invoicing/${invoice.invoiceRef}`} className="flex items-center gap-1.5">
                            <FileSpreadsheet className="h-3 w-3" /> {invoice.invoiceRef}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/customers/${invoice.customerId}`} className="font-medium hover:underline">
                            {invoice.customerName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/bdo/${invoice.sourceBdoId}`} className="text-xs hover:underline text-primary">
                            {invoice.sourceBdoId}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-sm">{invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`hover:bg-transparent ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-lg">{formatCurrency(invoice.total)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
