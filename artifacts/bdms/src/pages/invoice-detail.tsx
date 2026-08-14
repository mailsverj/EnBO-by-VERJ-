import { useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockInvoices, mockCustomers, formatCurrency } from '@/data/mock';
import { format } from 'date-fns';
import { ChevronRight, Download, Send, Edit, Sun, Building2, User, Mail, MapPin, Phone } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function InvoiceDetail() {
  const { id } = useParams();
  const invoice = mockInvoices.find(i => i.id === id);
  const customer = invoice ? mockCustomers.find(c => c.id === invoice.customerId) : null;

  if (!invoice) return <div className="p-8 text-center text-muted-foreground">Invoice not found</div>;

  const mockLineItems = [
    { desc: 'Jinko Tiger Pro 550W Solar Panel', qty: 10, unitPrice: 150000 },
    { desc: 'Felicity 5kVA 48V Hybrid Inverter', qty: 1, unitPrice: 580000 },
    { desc: 'Felicity 5kWh 48V Lithium Battery', qty: 2, unitPrice: 1150000 },
    { desc: 'Installation & BOS Materials', qty: 1, unitPrice: 420000 }
  ];

  const subtotal = mockLineItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
  const vat = subtotal * 0.075;
  const total = subtotal + vat;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/invoicing" className="hover:text-primary">Invoices</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-foreground font-medium">{invoice.id}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Edit className="h-4 w-4 mr-2" /> Edit</Button>
          <Button variant="outline"><Send className="h-4 w-4 mr-2" /> Send to BDO</Button>
          <Button><Download className="h-4 w-4 mr-2" /> Download PDF</Button>
        </div>
      </div>

      <Card className="overflow-hidden border-border shadow-md">
        <div className="h-2 bg-primary w-full"></div>
        <CardContent className="p-8 sm:p-12">
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-2xl tracking-tight mb-6">
                <Sun className="h-6 w-6 text-accent" />
                <span>VERJ<span className="opacity-70 font-medium">SOLAR</span></span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>12, Solar Way, Lekki Phase 1, Lagos</div>
                <div>hello@verjsolar.com</div>
                <div>+234 800 VERJ SOL</div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-light text-muted-foreground tracking-wider uppercase mb-2">Invoice</h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-end items-center gap-4">
                  <span className="text-muted-foreground">Invoice No:</span>
                  <span className="font-mono font-bold text-base">{invoice.id}</span>
                </div>
                <div className="flex justify-end items-center gap-4">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{format(new Date(invoice.date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-end items-center gap-4">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium">{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Badge className={invoice.status === 'Paid' ? 'bg-green-600' : 'bg-amber-600'} variant="default">{invoice.status}</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10 pb-8 border-b">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Bill To:</h3>
              <div className="font-semibold text-lg">{customer?.name || invoice.customerName}</div>
              <div className="text-sm text-muted-foreground mt-1 space-y-1">
                {customer ? (
                  <>
                    <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {customer.location}</div>
                    <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {customer.phone}</div>
                    <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {customer.email}</div>
                  </>
                ) : (
                  <div>Customer details unavailable.</div>
                )}
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Source BDO:</h3>
              <Link href={`/bdo/${invoice.sourceBdo}`} className="font-mono font-bold text-primary hover:underline inline-block">{invoice.sourceBdo}</Link>
              <div className="text-xs text-muted-foreground mt-1">Lead ID: {invoice.leadId}</div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-border/60">
                <TableHead className="text-xs uppercase font-semibold">Description</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-right w-[100px]">Qty</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-right w-[150px]">Unit Price</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-right w-[150px]">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLineItems.map((item, idx) => (
                <TableRow key={idx} className="border-b border-border/40 hover:bg-transparent">
                  <TableCell className="py-4 font-medium">{item.desc}</TableCell>
                  <TableCell className="py-4 text-right">{item.qty}</TableCell>
                  <TableCell className="py-4 text-right text-muted-foreground">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="py-4 text-right font-semibold">{formatCurrency(item.qty * item.unitPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end mt-8">
            <div className="w-[300px] space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">VAT (7.5%)</span>
                <span className="font-semibold">{formatCurrency(vat)}</span>
              </div>
              <div className="pt-3 border-t-2 border-border/60 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

        </CardContent>
        <div className="bg-muted/30 p-8 border-t text-sm text-muted-foreground text-center">
          Payment is due within 14 days. Bank: GTBank • Acct: 0123456789 • VERJ SOLAR LTD.
        </div>
      </Card>
    </div>
  );
}
