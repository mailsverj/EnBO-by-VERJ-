import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { Search, Filter, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'wouter';

export default function EngineeringDesigns() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['designs'],
    queryFn: () => api.designs.list(),
  });

  const designs = data?.designs ?? [];

  const filteredDesigns = designs.filter(d =>
    (d.customerName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    d.designRef.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-500/15 text-green-300 border-green-400/30';
      case 'Submitted for Approval': return 'bg-amber-500/15 text-amber-300 border-amber-400/30';
      case 'Draft': return 'bg-white/10 text-white/70 border-white/20';
      case 'Revision Required': return 'bg-red-500/15 text-red-300 border-red-400/30';
      default: return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Technical Designs</h1>
          <p className="text-muted-foreground mt-1">Review and approve solar system specifications.</p>
        </div>
        <Link href="/engineering/calculator">
          <Button>Open Calculator</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search designs..."
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
                    <TableHead>Design ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Linked Lead</TableHead>
                    <TableHead>System Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDesigns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No designs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDesigns.map(design => (
                      <TableRow key={design.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-mono text-xs font-semibold text-primary">{design.designRef}</TableCell>
                        <TableCell className="font-medium">{design.customerName}</TableCell>
                        <TableCell>
                          {design.leadRef ? (
                            <Link href={`/leads/${design.leadRef}`} className="text-xs hover:underline text-primary">
                              {design.leadRef}
                            </Link>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="font-semibold">{design.systemSize ?? '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(design.createdAt), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`hover:bg-transparent ${getStatusColor(design.status)}`}>
                            {design.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {design.status === 'Submitted for Approval' ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline">View</Button>
                          )}
                        </TableCell>
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
