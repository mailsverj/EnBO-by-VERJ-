import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockCustomers, formatCurrency } from '@/data/mock';
import { Search, Filter, Plus, Building2, User } from 'lucide-react';
import { Link } from 'wouter';

export default function Customers() {
  const [search, setSearch] = useState('');

  const filteredCustomers = mockCustomers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Directory</h1>
          <p className="text-muted-foreground mt-1">Manage all individual and business clients.</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> New Customer</Button>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search customers..." 
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
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Source BDO</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No customers found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map(customer => (
                    <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        <Link href={`/customers/${customer.id}`}>{customer.id}</Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/customers/${customer.id}`} className="block">
                          <div className="font-semibold">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">{customer.email}</div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          {customer.type === 'Business' ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                          {customer.type}
                        </div>
                      </TableCell>
                      <TableCell>{customer.location}</TableCell>
                      <TableCell>
                        <Link href={`/bdo/${customer.sourceBdo}`} className="text-xs font-medium hover:underline text-primary">
                          {customer.sourceBdo}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">{customer.leadCount}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(customer.totalValue)}</TableCell>
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
