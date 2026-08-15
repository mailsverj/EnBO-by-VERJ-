import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockInventory, mockPriceAudit, formatCurrency } from '@/data/mock';
import { Search, Filter, Plus, Edit2, History } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

export default function Inventory() {
  const [search, setSearch] = useState('');
  const { canSeePrices } = useAuth();
  const [auditSku, setAuditSku] = useState<string | null>(null);

  const filteredItems = mockInventory.filter(item => 
    item.model.toLowerCase().includes(search.toLowerCase()) || 
    item.sku.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const auditHistory = auditSku ? mockPriceAudit.filter(a => a.sku === auditSku) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Directory</h1>
          <p className="text-muted-foreground mt-1">Manage equipment catalog{canSeePrices() && ' and pricing'}.</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by SKU, model, or category..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" /> Category Filter
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Info</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Specs</TableHead>
                  {canSeePrices() && (
                    <>
                      <TableHead className="text-right">Cost Price</TableHead>
                      <TableHead className="text-right">Selling Price</TableHead>
                    </>
                  )}
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canSeePrices() ? 8 : 6} className="h-24 text-center text-muted-foreground">
                      No inventory items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map(item => (
                    <TableRow key={item.sku} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold">{item.sku}</TableCell>
                      <TableCell>
                        <div className="font-semibold">{item.model}</div>
                        <div className="text-xs text-muted-foreground">{item.brand}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-muted/30">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={item.specs}>
                        {item.specs}
                      </TableCell>
                      {canSeePrices() && (
                        <>
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(item.costPrice)}</TableCell>
                          <TableCell className="text-right font-medium text-primary">{formatCurrency(item.sellingPrice)}</TableCell>
                        </>
                      )}
                      <TableCell className="text-right">
                        <span className={`font-semibold ${item.stockQty < 10 ? 'text-red-600' : ''}`}>
                          {item.stockQty}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {canSeePrices() && (
                          <Button variant="ghost" size="icon" onClick={() => setAuditSku(item.sku)} title="Price History">
                            <History className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!auditSku} onOpenChange={(o) => !o && setAuditSku(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Price History: {auditSku}</DialogTitle>
          </DialogHeader>
          {auditHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead className="text-right">Prev</TableHead>
                  <TableHead className="text-right">New</TableHead>
                  <TableHead className="text-right">User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditHistory.map(audit => (
                  <TableRow key={audit.id}>
                    <TableCell className="text-sm">{format(new Date(audit.changedAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-sm capitalize">{audit.field.replace('Price', ' Price')}</TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">{formatCurrency(audit.prevValue)}</TableCell>
                    <TableCell className="text-right font-medium text-sm">{formatCurrency(audit.newValue)}</TableCell>
                    <TableCell className="text-right text-sm">{audit.changedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">No price changes recorded for this item.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}