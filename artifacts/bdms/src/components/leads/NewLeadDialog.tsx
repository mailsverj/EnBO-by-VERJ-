import { useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Loader2 } from 'lucide-react';
import { api, type CreateLeadInput, type Lead } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NewLeadDialogProps {
  children: ReactNode;
  onCreated?: (lead: Lead) => void;
}

interface LeadFormState {
  customerName: string;
  customerType: 'Individual' | 'Business';
  customerPhone: string;
  customerEmail: string;
  customerLocation: string;
  value: string;
  followUpDate: string;
  notes: string;
  sourceBdoId: string;
}

const emptyForm: LeadFormState = {
  customerName: '',
  customerType: 'Individual',
  customerPhone: '',
  customerEmail: '',
  customerLocation: '',
  value: '',
  followUpDate: '',
  notes: '',
  sourceBdoId: '',
};

export function NewLeadDialog({ children, onCreated }: NewLeadDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LeadFormState>(emptyForm);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isBdo = user?.roles.includes('BDO') ?? false;
  const canAssignBdo = user?.roles.some(role =>
    ['Chief Admin', 'Super Admin', 'Management', 'Sales Admin'].includes(role),
  ) ?? false;

  const { data: bdosData, isLoading: bdosLoading } = useQuery({
    queryKey: ['bdos'],
    queryFn: () => api.bdos.list(),
    enabled: open && !isBdo && canAssignBdo,
  });

  const activeBdos = (bdosData?.bdos ?? []).filter(bdo => bdo.status === 'Active');

  const createLead = useMutation({
    mutationFn: (input: CreateLeadInput) => api.leads.create(input),
    onSuccess: async ({ lead }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['leads'] }),
        queryClient.invalidateQueries({ queryKey: ['customers'] }),
        queryClient.invalidateQueries({ queryKey: ['bdos'] }),
      ]);
      toast({
        title: 'Lead created',
        description: `${lead.leadRef} has been added to the pipeline.`,
      });
      setForm(emptyForm);
      setOpen(false);
      onCreated?.(lead);
    },
  });

  const updateField = <K extends keyof LeadFormState>(field: K, value: LeadFormState[K]) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && !createLead.isPending) {
      setForm(emptyForm);
      createLead.reset();
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const input: CreateLeadInput = {
      customerName: form.customerName.trim(),
      customerType: form.customerType,
      customerPhone: form.customerPhone.trim() || undefined,
      customerEmail: form.customerEmail.trim() || undefined,
      customerLocation: form.customerLocation.trim() || undefined,
      value: form.value ? Number(form.value) : 0,
      followUpDate: form.followUpDate ? `${form.followUpDate}T09:00:00.000Z` : undefined,
      notes: form.notes.trim() || undefined,
      sourceBdoId: isBdo ? undefined : form.sourceBdoId || undefined,
    };

    createLead.mutate(input);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a new lead</DialogTitle>
          <DialogDescription>
            Add the customer opportunity to EnBO. A customer profile will be created and linked automatically.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="lead-customer-name">Customer or business name *</Label>
              <Input
                id="lead-customer-name"
                value={form.customerName}
                onChange={event => updateField('customerName', event.target.value)}
                placeholder="e.g. Adewale Residence or Northpoint Foods"
                minLength={2}
                maxLength={160}
                autoFocus
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-customer-type">Customer type</Label>
              <Select
                value={form.customerType}
                onValueChange={value => updateField('customerType', value as LeadFormState['customerType'])}
              >
                <SelectTrigger id="lead-customer-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isBdo && canAssignBdo && (
              <div className="space-y-2">
                <Label htmlFor="lead-source-bdo">Assign to BDO *</Label>
                <Select value={form.sourceBdoId} onValueChange={value => updateField('sourceBdoId', value)}>
                  <SelectTrigger id="lead-source-bdo">
                    <SelectValue placeholder={bdosLoading ? 'Loading BDOs…' : 'Select an active BDO'} />
                  </SelectTrigger>
                  <SelectContent>
                    {activeBdos.map(bdo => (
                      <SelectItem key={bdo.vbdoId} value={bdo.vbdoId}>
                        {bdo.vbdoId} — {bdo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="lead-phone">Phone number</Label>
              <Input
                id="lead-phone"
                type="tel"
                value={form.customerPhone}
                onChange={event => updateField('customerPhone', event.target.value)}
                placeholder="+234..."
                maxLength={40}
                autoComplete="tel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-email">Email address</Label>
              <Input
                id="lead-email"
                type="email"
                value={form.customerEmail}
                onChange={event => updateField('customerEmail', event.target.value)}
                placeholder="customer@example.com"
                maxLength={320}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="lead-location">Installation location</Label>
              <Input
                id="lead-location"
                value={form.customerLocation}
                onChange={event => updateField('customerLocation', event.target.value)}
                placeholder="Town, LGA, State"
                maxLength={240}
                autoComplete="street-address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-value">Estimated project value (₦)</Label>
              <Input
                id="lead-value"
                type="number"
                inputMode="numeric"
                min={0}
                max={2_000_000_000}
                step={1}
                value={form.value}
                onChange={event => updateField('value', event.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-follow-up">Next follow-up date</Label>
              <Input
                id="lead-follow-up"
                type="date"
                value={form.followUpDate}
                onChange={event => updateField('followUpDate', event.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="lead-notes">Opportunity notes</Label>
              <Textarea
                id="lead-notes"
                value={form.notes}
                onChange={event => updateField('notes', event.target.value)}
                placeholder="Customer needs, existing power challenges, preferred contact time…"
                maxLength={2_000}
                rows={4}
              />
            </div>
          </div>

          {isBdo && !user?.vbdoId && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              Your account is missing a VBDO ID. Contact an administrator before creating a lead.
            </div>
          )}

          {createLead.isError && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {createLead.error instanceof Error ? createLead.error.message : 'The lead could not be created.'}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={createLead.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createLead.isPending ||
                form.customerName.trim().length < 2 ||
                (isBdo ? !user?.vbdoId : !form.sourceBdoId)
              }
            >
              {createLead.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Lead
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}