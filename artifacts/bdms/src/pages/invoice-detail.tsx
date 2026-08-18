import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { formatCurrency } from '@/data/mock';
import { format } from 'date-fns';
import {
  ChevronRight, Download, Send, Edit, MapPin, Phone, Mail,
  CheckCircle2, XCircle, Loader2, Shield, X
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/store/auth';
import { useToast } from '@/hooks/use-toast';
import { CopyButton } from '@/components/ui/copy-button';
import logoPath from '@assets/Copy_of_Modern_Cabinet_Furniture_Product_1786754353697.png';

const WARRANTY_OPTIONS = [
  { key: 'battery_10y', label: 'Battery: 10-year manufacturer warranty' },
  { key: 'battery_5y', label: '5-year manufacturer warranty' },
  { key: 'battery_2y', label: '2-year manufacturer warranty' },
  { key: 'workmanship_12m', label: '12-month VERJ warranty on workmanship' },
];

export default function InvoiceDetail() {
  const { id } = useParams();
  const { canSeePrices, user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [warrantyOpen, setWarrantyOpen] = useState(false);
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => api.invoices.get(id!),
    enabled: !!id,
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.customers.list(),
  });

  const updateMut = useMutation({
    mutationFn: (patch: Record<string, unknown>) => api.invoices.update(id!, patch as never),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoice', id] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const invoice = data?.invoice;
  const customers = customersData?.customers ?? [];
  const customer = invoice ? customers.find(c => c.cidRef === invoice.customerId) : null;

  if (!invoice) return <div className="p-8 text-center text-muted-foreground">Invoice not found</div>;

  const lineItems = Array.isArray(invoice.lineItems)
    ? invoice.lineItems as Array<{ desc: string; qty: number; unitPrice: number; category: string }>
    : [];

  const solarPlanItems = lineItems.length > 0 ? lineItems : [
    { desc: 'Jinko Tiger Pro 550W Solar Panels', qty: 20, unitPrice: 150000, category: 'panel' },
    { desc: 'Felicity 5kWh 48V Lithium Battery', qty: 4, unitPrice: 1150000, category: 'battery' },
    { desc: 'Deye 12kW Hybrid Inverter', qty: 1, unitPrice: 1450000, category: 'inverter' },
    { desc: 'PV Cable (6mm²)', qty: 2, unitPrice: 60000, category: 'pv_cable' },
    { desc: 'AC Cable (16mm²)', qty: 1, unitPrice: 85000, category: 'ac_cable' },
    { desc: 'Installation Accessories', qty: 1, unitPrice: 380000, category: 'accessories' },
    { desc: 'Installation Service', qty: 1, unitPrice: 850000, category: 'installation' },
  ];

  const subtotal = invoice.subtotal || solarPlanItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
  const vat = subtotal * 0.075;
  const total = invoice.total || subtotal + vat;

  const currentPolicies: string[] = Array.isArray(invoice.warrantyPolicies) ? invoice.warrantyPolicies as string[] : [];

  const handleApprove = async () => {
    await updateMut.mutateAsync({ status: 'Approved' } as never);
    toast({ title: 'Invoice approved', description: 'PDF has been sent internally.' });
  };

  const handleReject = async () => {
    await updateMut.mutateAsync({ status: 'Rejected' } as never);
    toast({ title: 'Invoice rejected' });
  };

  const handleSaveWarranty = async () => {
    await updateMut.mutateAsync({ warrantyPolicies: selectedPolicies } as never);
    setWarrantyOpen(false);
    toast({ title: 'Warranty policies saved' });
  };

  const openWarrantyDialog = () => {
    setSelectedPolicies(currentPolicies);
    setWarrantyOpen(true);
  };

  const pdfUrl = `${window.location.origin}${import.meta.env.BASE_URL ?? ''}api/invoices/${invoice.invoiceRef}/pdf`;
  const invoiceUrl = `${window.location.origin}${(import.meta.env.BASE_URL ?? '/').replace(/\/$/, '')}/invoicing/${invoice.invoiceRef}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/invoicing" className="hover:text-primary">Invoices</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-foreground font-medium">{invoice.invoiceRef}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Easy copy buttons */}
          <CopyButton value={invoiceUrl} label="Invoice Link" />
          <CopyButton value={pdfUrl} label="PDF Link" />

          {invoice.status === 'Pending Approval' && canSeePrices() && (
            <>
              <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={handleReject} disabled={updateMut.isPending}>
                <XCircle className="h-4 w-4 mr-2" /> Reject
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={updateMut.isPending}>
                {updateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Approve & Send PDF
              </Button>
            </>
          )}

          <Button variant="outline" onClick={openWarrantyDialog}>
            <Shield className="h-4 w-4 mr-2" /> Warranty
          </Button>

          <a href={`${import.meta.env.BASE_URL ?? ''}api/invoices/${invoice.invoiceRef}/pdf`} target="_blank" rel="noopener noreferrer">
            <Button>
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
          </a>
        </div>
      </div>

      {/* Invoice card */}
      <Card className="overflow-hidden border-border shadow-md">
        <div className="h-2 bg-primary w-full" />
        <CardContent className="p-6 sm:p-10 pb-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="mb-4">
                <img src={logoPath} alt="VERJ SOLAR" className="h-12 object-contain" style={{ filter: 'brightness(0)' }} />
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>9 Badaru Street, Jakande, Lekki, Lagos</div>
                <div>hello@verj.ng</div>
                <div>+234 800 VERJ SOL</div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-light text-muted-foreground tracking-wider uppercase mb-2">Invoice</h2>
              <div className="text-sm space-y-1.5">
                <div className="flex justify-end items-center gap-4">
                  <span className="text-muted-foreground">Invoice No:</span>
                  <span className="font-mono font-bold">{invoice.invoiceRef}</span>
                  <CopyButton value={invoice.invoiceRef} size="xs" />
                </div>
                <div className="flex justify-end items-center gap-4">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</span>
                </div>
                {invoice.dueDate && (
                  <div className="flex justify-end items-center gap-4">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-col items-end gap-2">
                <Badge className={invoice.status === 'Paid' ? 'bg-green-600' : invoice.status === 'Approved' ? 'bg-blue-600' : 'bg-amber-600'}>{invoice.status}</Badge>
                {invoice.approvedById && <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">Approved</Badge>}
              </div>
            </div>
          </div>

          {/* Bill To / BDO */}
          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Bill To:</h3>
              <div className="font-semibold text-lg">{customer?.name || invoice.customerName}</div>
              <div className="text-sm text-muted-foreground mt-1 space-y-1">
                {customer ? (
                  <>
                    <div className="font-mono text-xs mb-1">ID: {customer.cidRef}</div>
                    {customer.location && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {customer.location}</div>}
                    {customer.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {customer.phone}</div>}
                    {customer.email && <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {customer.email}</div>}
                  </>
                ) : (
                  <div>Customer details unavailable.</div>
                )}
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Source BDO:</h3>
              <Link href={`/bdo/${invoice.sourceBdoId}`} className="font-mono font-bold text-primary hover:underline inline-block">{invoice.sourceBdoId}</Link>
              {invoice.leadRef && <div className="text-xs text-muted-foreground mt-1">Lead ID: {invoice.leadRef}</div>}
            </div>
          </div>

          {invoice.planName && (
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{invoice.planName}</h3>
            </div>
          )}

          {/* Line items */}
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-border/60">
                <TableHead className="text-xs uppercase font-semibold">Description</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-right w-[80px]">Qty</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-right w-[140px]">Unit Price</TableHead>
                <TableHead className="text-xs uppercase font-semibold text-right w-[140px]">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solarPlanItems.map((item, idx) => (
                <TableRow key={idx} className="border-b border-border/40 hover:bg-transparent">
                  <TableCell className="py-3 font-medium">{item.desc}</TableCell>
                  <TableCell className="py-3 text-right">{item.qty}</TableCell>
                  <TableCell className="py-3 text-right text-muted-foreground">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="py-3 text-right font-semibold">{formatCurrency(item.qty * item.unitPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="flex justify-between items-start mt-8 border-b pb-8 gap-6">
            <div className="text-xs text-muted-foreground">
              Thank you for choosing VERJ SOLAR.
            </div>
            <div className="w-[280px] space-y-2.5 flex-shrink-0">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">VAT (7.5%)</span>
                <span className="font-semibold">{formatCurrency(vat)}</span>
              </div>
              <div className="pt-2 border-t-2 border-border/60 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Warranty policies */}
          {currentPolicies.length > 0 && (
            <div className="mt-6 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" /> Warranty & Policies
              </div>
              <ul className="space-y-1">
                {currentPolicies.map(key => {
                  const opt = WARRANTY_OPTIONS.find(o => o.key === key);
                  return (
                    <li key={key} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {opt?.label ?? key}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Footer meta */}
          <div className="pt-6 text-xs text-muted-foreground flex justify-between items-center">
            <div>Created by: System Auto-Gen</div>
            <div>{invoice.approvedByName && `Approved by: ${invoice.approvedByName} | `}{invoice.issuedAt && `Issued: ${format(new Date(invoice.issuedAt), 'MMM d, yyyy')}`}</div>
          </div>
        </CardContent>

        {/* Payment footer */}
        <div className="bg-muted/30 p-6 border-t text-sm text-muted-foreground text-center">
          Payment is due within 14 days. Bank: GTBank • Acct: 0123456789 • VERJ SOLAR LTD.
        </div>
      </Card>

      {/* Warranty policies dialog */}
      <Dialog open={warrantyOpen} onOpenChange={setWarrantyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Shield className="h-4 w-4" /> Warranty & Policies</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Select the warranty policies to include on this invoice.</p>
          <div className="space-y-3 py-2">
            {WARRANTY_OPTIONS.map(opt => (
              <div key={opt.key} className="flex items-start gap-3">
                <Checkbox
                  id={opt.key}
                  checked={selectedPolicies.includes(opt.key)}
                  onCheckedChange={(checked) => {
                    setSelectedPolicies(prev =>
                      checked ? [...prev, opt.key] : prev.filter(k => k !== opt.key)
                    );
                  }}
                  className="mt-0.5"
                />
                <Label htmlFor={opt.key} className="text-sm leading-snug cursor-pointer">{opt.label}</Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarrantyOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveWarranty} disabled={updateMut.isPending}>
              {updateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Policies
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
