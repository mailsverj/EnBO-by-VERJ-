import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockInventory, formatCurrency } from '@/data/mock';
import { Search, Filter, Plus, Edit2 } from 'lucide-react';

export default function Inventory() {
  const [search, setSearch] = useState('');

  const filteredItems = mockInventory.filter(item => 
    item.model.toLowerCase().includes(search.toLowerCase()) || 
    item.sku.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Directory</h1>
          <p className="text-muted-foreground mt-1">Manage equipment catalog and pricing.</p>
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
                  <TableHead className="text-right">Cost Price</TableHead>
                  <TableHead className="text-right">Selling Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(item.costPrice)}</TableCell>
                      <TableCell className="text-right font-medium text-primary">{formatCurrency(item.sellingPrice)}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${item.stockQty < 10 ? 'text-red-600' : ''}`}>
                          {item.stockQty}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
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
    </div>
  );
}
