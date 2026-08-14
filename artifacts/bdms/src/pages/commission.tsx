import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockCommissions, formatCurrency } from '@/data/mock';
import { Search, Filter, Wallet, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'wouter';

export default function Commission() {
  const [search, setSearch] = useState('');

  const filteredComms = mockCommissions.filter(c => 
    c.bdoName.toLowerCase().includes(search.toLowerCase()) || 
    c.bdoId.toLowerCase().includes(search.toLowerCase()) ||
    c.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const totalLiability = mockCommissions.reduce((sum, c) => sum + c.amount, 0);
  const totalPaid = mockCommissions.filter(c => c.status === 'Paid').reduce((sum, c) => sum + c.amount, 0);
  const totalPending = mockCommissions.filter(c => c.status === 'Pending').reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Commission Ledger</h1>
        <p className="text-muted-foreground mt-1">Track and manage BDO payouts (3% fixed rate).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-primary-foreground/70">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalPending)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Total Paid Out</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Total Liability Generated</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalLiability)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by BDO or customer..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
            <Button><ArrowUpRight className="h-4 w-4 mr-2" /> Process Payouts</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record ID</TableHead>
                  <TableHead>BDO</TableHead>
                  <TableHead>Linked Project / Customer</TableHead>
                  <TableHead className="text-right">Project Value</TableHead>
                  <TableHead className="text-right">Commission (3%)</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      No commission records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComms.map(record => (
                    <TableRow key={record.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold">{record.id}</TableCell>
                      <TableCell>
                        <div className="font-semibold">{record.bdoName}</div>
                        <Link href={`/bdo/${record.bdoId}`} className="text-xs text-primary hover:underline">{record.bdoId}</Link>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{record.customerName}</div>
                        <Link href={`/leads/${record.leadId}`} className="text-xs text-muted-foreground hover:text-primary hover:underline">{record.leadId}</Link>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(record.projectValue)}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{formatCurrency(record.amount)}</TableCell>
                      <TableCell className="text-sm">{format(new Date(record.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={record.status === 'Paid' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {record.status === 'Pending' && (
                          <Button size="sm" variant="outline" className="text-xs">Mark Paid</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
