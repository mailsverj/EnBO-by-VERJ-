import { useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockInvoices, mockCustomers, formatCurrency } from '@/data/mock';
import { format } from 'date-fns';
import { ChevronRight, Download, Send, Edit, Sun, Building2, User, Mail, MapPin, Phone, CheckCircle2, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/store/auth';
import logoPath from '@assets/Copy_of_Modern_Cabinet_Furniture_Product_1786754353697.png';

export default function InvoiceDetail() {
  const { id } = useParams();
  const { canSeePrices, user } = useAuth();
  const invoice = mockInvoices.find(i => i.id === id);
  const customer = invoice ? mockCustomers.find(c => c.id === invoice.customerId) : null;

  if (!invoice) return <div className="p-8 text-center text-muted-foreground">Invoice not found</div>;

  const solarPlanItems = [
    { desc: 'Jinko Tiger Pro 550W Solar Panels', qty: 20, unitPrice: 150000, category: 'panel' },
    { desc: 'Felicity 5kWh 48V Lithium Battery', qty: 4, unitPrice: 1150000, category: 'battery' },
    { desc: 'Deye 12kW Hybrid Inverter', qty: 1, unitPrice: 1450000, category: 'inverter' },
    { desc: 'PV Cable (6mm²)', qty: 2, unitPrice: 60000, category: 'pv_cable' },
    { desc: 'AC Cable (16mm²)', qty: 1, unitPrice: 85000, category: 'ac_cable' },
    { desc: 'Installation Accessories', qty: 1, unitPrice: 380000, category: 'accessories' },
    { desc: 'Installation Service', qty: 1, unitPrice: 850000, category: 'installation' },
  ];

  const subtotal = solarPlanItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
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
          {invoice.status === 'Pending Approval' && canSeePrices() && (
            <>
              <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50"><XCircle className="h-4 w-4 mr-2" /> Reject</Button>
              <Button className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="h-4 w-4 mr-2" /> Approve Invoice</Button>
            </>
          )}
          <Button variant="outline"><Edit className="h-4 w-4 mr-2" /> Edit</Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><Send className="h-4 w-4 mr-2" /> Share</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Share to BDO & Customer</DropdownMenuItem>
              <DropdownMenuItem>Share to BDO Only</DropdownMenuItem>
              <DropdownMenuItem>Share to Customer Only</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button><Download className="h-4 w-4 mr-2" /> Download PDF</Button>
        </div>
      </div>

      <Card className="overflow-hidden border-border shadow-md">
        <div className="h-2 bg-primary w-full"></div>
        <CardContent className="p-8 sm:p-12 pb-6">
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="mb-6">
                <img src={logoPath} alt="VERJ SOLAR" className="h-14 object-contain" style={{ filter: 'brightness(0)' }} />
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>9 Badaru Street, Jakande, Lekki, Lagos</div>
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
              <div className="mt-4 flex flex-col items-end gap-2">
                <Badge className={invoice.status === 'Paid' ? 'bg-green-600' : 'bg-amber-600'} variant="default">{invoice.status}</Badge>
                {invoice.approvedBy && <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">Approved</Badge>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Bill To:</h3>
              <div className="font-semibold text-lg">{customer?.name || invoice.customerName}</div>
              <div className="text-sm text-muted-foreground mt-1 space-y-1">
                {customer ? (
                  <>
                    <div className="font-mono text-xs mb-2">ID: {customer.id}</div>
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

          <div className="mb-4">
            <h3 className="font-semibold text-lg">{invoice.planName}</h3>
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
              {solarPlanItems.map((item, idx) => (
                <TableRow key={idx} className="border-b border-border/40 hover:bg-transparent">
                  <TableCell className="py-4 font-medium">{item.desc}</TableCell>
                  <TableCell className="py-4 text-right">{item.qty}</TableCell>
                  <TableCell className="py-4 text-right text-muted-foreground">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="py-4 text-right font-semibold">{formatCurrency(item.qty * item.unitPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-end mt-8 border-b pb-8">
            <div className="text-xs text-muted-foreground">
              Thank you for choosing VERJ SOLAR.
            </div>
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
          
          <div className="pt-6 text-xs text-muted-foreground flex justify-between items-center">
            <div>Created by: System Auto-Gen</div>
            <div>{invoice.approvedBy && `Approved by: ${invoice.approvedBy} | `}{invoice.issuedAt && `Issued: ${format(new Date(invoice.issuedAt), 'MMM d, yyyy')}`}</div>
          </div>
        </CardContent>
        <div className="bg-muted/30 p-8 border-t text-sm text-muted-foreground text-center">
          Payment is due within 14 days. Bank: GTBank • Acct: 0123456789 • VERJ SOLAR LTD.
        </div>
      </Card>
    </div>
  );
}