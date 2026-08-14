import { useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockLeads, mockCustomers, mockDesigns, mockInvoices, formatCurrency } from '@/data/mock';
import { format } from 'date-fns';
import { ChevronRight, FileText, UserSquare2, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function LeadDetail() {
  const { id } = useParams();
  const lead = mockLeads.find(l => l.id === id);
  const customer = lead ? mockCustomers.find(c => c.id === lead.customerId) : null;
  const design = lead ? mockDesigns.find(d => d.leadId === lead.id) : null;
  const invoice = lead ? mockInvoices.find(i => i.leadId === lead.id) : null;

  if (!lead) return <div className="p-8 text-center text-muted-foreground">Lead not found</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <Link href="/leads" className="hover:text-primary">Pipeline</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-foreground font-medium">{lead.id}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{lead.customerName}</h1>
            <Badge variant="outline" className="font-mono text-xs">{lead.id}</Badge>
          </div>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            <div>Source: <span className="font-medium text-foreground">{lead.sourceBdo}</span></div>
            <div>Created: {format(new Date(lead.createdAt), 'MMM d, yyyy')}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Details</Button>
          <Button>Update Stage</Button>
        </div>
      </div>

      <div className="bg-muted/40 border rounded-lg p-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Current Stage</div>
          <div className="text-lg font-bold text-primary">{lead.stage}</div>
        </div>
        <div className="text-right space-y-1">
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Project Value</div>
          <div className="text-2xl font-bold">{lead.value > 0 ? formatCurrency(lead.value) : 'TBD'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">BDO</span>
                  </div>
                  <div className="flex-1 bg-muted/20 p-3 rounded-md border">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold">{lead.sourceBdo}</span>
                      <span className="text-muted-foreground">{format(new Date(lead.updatedAt), 'MMM d, yyyy HH:mm')}</span>
                    </div>
                    <p className="text-sm">Customer has shared their recent electricity bills. Ready for technical assessment.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-accent">SYS</span>
                  </div>
                  <div className="flex-1 bg-muted/20 p-3 rounded-md border">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold">System</span>
                      <span className="text-muted-foreground">{format(new Date(lead.createdAt), 'MMM d, yyyy HH:mm')}</span>
                    </div>
                    <p className="text-sm">Lead generated and assigned to {lead.sourceBdo}.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Add Update</h4>
                <Textarea placeholder="Type an update..." className="mb-2" />
                <div className="flex justify-end">
                  <Button size="sm">Post Update</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {customer ? (
                <>
                  <div className="flex items-center gap-2">
                    <UserSquare2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{customer.name}</span>
                  </div>
                  <div className="text-muted-foreground">{customer.type} • {customer.location}</div>
                  <div>{customer.email}</div>
                  <div>{customer.phone}</div>
                  <Link href={`/customers/${customer.id}`} className="text-primary hover:underline text-xs mt-2 inline-block">View Full Profile</Link>
                </>
              ) : (
                <div className="text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> No customer profile linked
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Linked Artifacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {design ? (
                <div className="p-3 border rounded-md bg-muted/10">
                  <div className="text-xs text-muted-foreground mb-1">Technical Design</div>
                  <div className="flex items-center justify-between">
                    <Link href="/engineering/designs" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                      <FileText className="h-3 w-3" /> {design.id}
                    </Link>
                    <Badge variant="outline" className="text-[10px]">{design.status}</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground border border-dashed p-3 rounded-md text-center">No design attached</div>
              )}

              {invoice ? (
                <div className="p-3 border rounded-md bg-muted/10">
                  <div className="text-xs text-muted-foreground mb-1">Invoice</div>
                  <div className="flex items-center justify-between">
                    <Link href={`/invoicing/${invoice.id}`} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                      <FileText className="h-3 w-3" /> {invoice.id}
                    </Link>
                    <Badge className={invoice.status === 'Paid' ? 'bg-green-600' : 'bg-amber-600'} variant="outline">{invoice.status}</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground border border-dashed p-3 rounded-md text-center">No invoice attached</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
