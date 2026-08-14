import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockBdos, formatCurrency } from '@/data/mock';
import { Search, Filter } from 'lucide-react';
import { Link } from 'wouter';

export default function BdoDirectory() {
  const [search, setSearch] = useState('');

  const filteredBdos = mockBdos.filter(bdo => 
    bdo.name.toLowerCase().includes(search.toLowerCase()) || 
    bdo.id.toLowerCase().includes(search.toLowerCase()) ||
    bdo.location.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      case 'Suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">BDO Directory</h1>
          <p className="text-muted-foreground mt-1">Manage onboarded Business Development Officers.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, VBDO ID, or location..." 
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
                  <TableHead>VBDO ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total Leads</TableHead>
                  <TableHead className="text-right">Project Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBdos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No BDOs found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBdos.map(bdo => (
                    <TableRow key={bdo.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        <Link href={`/bdo/${bdo.id}`}>{bdo.id}</Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/bdo/${bdo.id}`} className="block">
                          <div className="font-semibold">{bdo.name}</div>
                          <div className="text-xs text-muted-foreground">{bdo.email}</div>
                        </Link>
                      </TableCell>
                      <TableCell>{bdo.location}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`hover:bg-transparent ${getStatusColor(bdo.status)}`}>
                          {bdo.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{bdo.leadsCount}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(bdo.totalValue)}</TableCell>
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
