import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockDesigns } from '@/data/mock';
import { Search, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'wouter';

export default function EngineeringDesigns() {
  const [search, setSearch] = useState('');

  const filteredDesigns = mockDesigns.filter(d => 
    d.customerName.toLowerCase().includes(search.toLowerCase()) || 
    d.id.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Submitted for Approval': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      case 'Revision Required': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
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
                      <TableCell className="font-mono text-xs font-semibold text-primary">{design.id}</TableCell>
                      <TableCell className="font-medium">{design.customerName}</TableCell>
                      <TableCell>
                        <Link href={`/leads/${design.leadId}`} className="text-xs hover:underline text-primary">
                          {design.leadId}
                        </Link>
                      </TableCell>
                      <TableCell className="font-semibold">{design.systemSize}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
