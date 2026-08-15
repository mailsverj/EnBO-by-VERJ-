import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Eye, CheckCircle2, XCircle, RefreshCw, Power, Copy, ExternalLink, Link2, Settings2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { api, type Application } from '@/lib/api';

const ENGINEER_OPTIONS = [
  { id: '3', name: 'Chidi Nwosu', role: 'Lead Technical Officer' },
];

export default function BdoApplications() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => api.applications.list(),
  });
  const apps = data?.applications ?? [];

  const updateMut = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<Application> }) =>
      api.applications.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isResubmitOpen, setIsResubmitOpen] = useState(false);
  const [isActivateOpen, setIsActivateOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [resubmitNote, setResubmitNote] = useState('');
  const [assignedEngineerId, setAssignedEngineerId] = useState('');
  const [formSettingsOpen, setFormSettingsOpen] = useState(false);

  // Generated credentials for Activate dialog (kept stable while dialog is open)
  const [genUsername] = useState(() => '');
  const [genPassword] = useState(() => '');

  const defaultFormConfig = [
    { key: 'fullName', label: 'Full Name', step: 1, enabled: true, required: true },
    { key: 'email', label: 'Email Address', step: 1, enabled: true, required: true },
    { key: 'phone', label: 'Phone Number', step: 1, enabled: true, required: true },
    { key: 'gender', label: 'Gender', step: 1, enabled: true, required: true },
    { key: 'dob', label: 'Date of Birth', step: 1, enabled: true, required: true },
    { key: 'state', label: 'State of Residence', step: 1, enabled: true, required: true },
    { key: 'lga', label: 'LGA', step: 1, enabled: true, required: false },
    { key: 'address', label: 'Home Address', step: 1, enabled: true, required: true },
    { key: 'nin', label: 'NIN', step: 2, enabled: true, required: true },
    { key: 'bvn', label: 'BVN', step: 2, enabled: true, required: true },
    { key: 'bankName', label: 'Bank Name', step: 2, enabled: true, required: true },
    { key: 'accountNumber', label: 'Account Number', step: 2, enabled: true, required: true },
    { key: 'accountName', label: 'Account Name', step: 2, enabled: true, required: true },
    { key: 'guarantorName', label: 'Guarantor Name', step: 2, enabled: true, required: true },
    { key: 'guarantorPhone', label: 'Guarantor Phone', step: 2, enabled: true, required: true },
    { key: 'guarantorRelationship', label: 'Guarantor Relationship', step: 2, enabled: true, required: true },
    { key: 'guarantorAddress', label: 'Guarantor Address', step: 2, enabled: false, required: false },
    { key: 'referralSource', label: 'How did you hear about VERJ?', step: 3, enabled: true, required: true },
    { key: 'salesExperience', label: 'Sales Experience', step: 3, enabled: true, required: true },
    { key: 'statement', label: 'Why do you want to be a VERJ BDO?', step: 3, enabled: true, required: true },
  ];
  const [formConfig, setFormConfig] = useState(defaultFormConfig);

  const copyFormLink = () => {
    const base = window.location.origin + (import.meta.env.BASE_URL || '/');
    const url = base.replace(/\/$/, '') + '/apply';
    navigator.clipboard.writeText(url);
    toast({ title: 'Form link copied!', description: url });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'KYC Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Shortlisted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Activated': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const updateStatus = async (id: number, status: string, extra?: Partial<Application>) => {
    await updateMut.mutateAsync({ id, patch: { status, ...extra } });
    setIsRejectOpen(false);
    setIsResubmitOpen(false);
    setIsActivateOpen(false);
    setSelectedApp(null);
    toast({ title: `Status updated to ${status}` });
  };

  const handleActivate = async () => {
    if (!selectedApp) return;
    const firstName = selectedApp.fullName.split(' ')[0].toLowerCase();
    const username = `vbdo.${firstName}.${Math.floor(Math.random() * 9000 + 1000)}`;
    await updateStatus(selectedApp.id, 'Activated', {
      generatedUsername: username,
      assignedEngineerId: assignedEngineerId || undefined,
    });
    toast({
      title: 'BDO Account Created',
      description: `${selectedApp.fullName} has been activated as a BDO (${username}).`,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">BDO Applications</h1>
          <p className="text-muted-foreground mt-1">Review and process prospective Business Development Officers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyFormLink}>
            <Link2 className="h-4 w-4 mr-2" /> Copy Form Link
          </Button>
          <Button variant="outline" onClick={() => setFormSettingsOpen(true)}>
            <Settings2 className="h-4 w-4 mr-2" /> Form Settings
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Ref</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No applications yet.</TableCell></TableRow>
                )}
                {apps.map(app => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium text-xs text-muted-foreground">{app.refId}</TableCell>
                    <TableCell>
                      <div className="font-semibold">{app.fullName}</div>
                      <div className="text-xs text-muted-foreground">{app.email}</div>
                    </TableCell>
                    <TableCell>{app.state}{app.lga ? `, ${app.lga}` : ''}</TableCell>
                    <TableCell>{format(new Date(app.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(app.status)}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedApp(app)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog open={!!selectedApp && !isRejectOpen && !isResubmitOpen && !isActivateOpen} onOpenChange={(o) => !o && setSelectedApp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details: {selectedApp?.fullName}</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><div className="text-muted-foreground mb-1">Email</div><div className="font-medium">{selectedApp.email}</div></div>
                <div><div className="text-muted-foreground mb-1">Phone</div><div className="font-medium">{selectedApp.phone}</div></div>
                <div><div className="text-muted-foreground mb-1">Location</div><div className="font-medium">{selectedApp.state}{selectedApp.lga ? `, ${selectedApp.lga}` : ''}</div></div>
                <div><div className="text-muted-foreground mb-1">Applied On</div><div className="font-medium">{format(new Date(selectedApp.createdAt), 'MMMM d, yyyy')}</div></div>
                {selectedApp.nin && <div><div className="text-muted-foreground mb-1">NIN</div><div className="font-medium font-mono">{selectedApp.nin}</div></div>}
                {selectedApp.bankName && <div><div className="text-muted-foreground mb-1">Bank</div><div className="font-medium">{selectedApp.bankName} — {selectedApp.accountNumber}</div></div>}
                {selectedApp.guarantorName && <div><div className="text-muted-foreground mb-1">Guarantor</div><div className="font-medium">{selectedApp.guarantorName} ({selectedApp.guarantorRelationship})</div></div>}
                {selectedApp.salesExperience && <div><div className="text-muted-foreground mb-1">Sales Experience</div><div className="font-medium">{selectedApp.salesExperience}</div></div>}
              </div>
              {selectedApp.statement && (
                <div><div className="text-muted-foreground mb-1 text-sm">Statement</div><div className="text-sm border rounded-md p-3 bg-muted/30">{selectedApp.statement}</div></div>
              )}
              {selectedApp.adminNotes && (
                <div><div className="text-muted-foreground mb-1 text-sm">Admin Notes</div><div className="text-sm border rounded-md p-3 bg-amber-50 text-amber-900">{selectedApp.adminNotes}</div></div>
              )}
              <div className="flex justify-end gap-2 pt-4 border-t">
                {selectedApp.status !== 'Rejected' && selectedApp.status !== 'Activated' && (
                  <Button variant="destructive" onClick={() => setIsRejectOpen(true)}>
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                )}
                {selectedApp.status !== 'Submitted' && selectedApp.status !== 'Rejected' && selectedApp.status !== 'Activated' && (
                  <Button variant="outline" onClick={() => setIsResubmitOpen(true)}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Request Resubmission
                  </Button>
                )}
                {selectedApp.status === 'Submitted' && (
                  <Button onClick={() => updateStatus(selectedApp.id, 'KYC Pending')}>Request KYC</Button>
                )}
                {selectedApp.status === 'KYC Pending' && (
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => updateStatus(selectedApp.id, 'Shortlisted')}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Approve & Shortlist
                  </Button>
                )}
                {selectedApp.status === 'Shortlisted' && (
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsActivateOpen(true)}>
                    <Power className="h-4 w-4 mr-2" /> Activate BDO
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this application.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Rejection reason..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => selectedApp && updateStatus(selectedApp.id, 'Rejected', { adminNotes: rejectReason })}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resubmit Dialog */}
      <Dialog open={isResubmitOpen} onOpenChange={setIsResubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Resubmission</DialogTitle>
            <DialogDescription>What needs to be fixed or resubmitted?</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="e.g. Utility bill is blurred…" value={resubmitNote} onChange={e => setResubmitNote(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResubmitOpen(false)}>Cancel</Button>
            <Button onClick={() => selectedApp && updateStatus(selectedApp.id, 'Submitted', { adminNotes: resubmitNote })}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Dialog */}
      <Dialog open={isActivateOpen} onOpenChange={setIsActivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate BDO Account</DialogTitle>
            <DialogDescription>Finalise account creation for {selectedApp?.fullName}.</DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Generated Username</Label>
                  <Input value={genUsername || `vbdo.${selectedApp.fullName.split(' ')[0].toLowerCase()}.${Math.floor(Math.random() * 9000 + 1000)}`} readOnly className="bg-muted font-mono text-sm" />
                </div>
                <div className="space-y-1">
                  <Label>Temporary Password</Label>
                  <Input value={genPassword || 'VERJ@2026'} readOnly className="bg-muted font-mono text-sm" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Label>Assigned Engineer</Label>
                <Select value={assignedEngineerId} onValueChange={setAssignedEngineerId}>
                  <SelectTrigger><SelectValue placeholder="Select supervising engineer" /></SelectTrigger>
                  <SelectContent>
                    {ENGINEER_OPTIONS.map(eng => (
                      <SelectItem key={eng.id} value={eng.id}>{eng.name} ({eng.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox id="notify-email" defaultChecked />
                  <Label htmlFor="notify-email" className="font-normal cursor-pointer">Send welcome email with credentials</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="notify-whatsapp" defaultChecked />
                  <Label htmlFor="notify-whatsapp" className="font-normal cursor-pointer">Send WhatsApp notification</Label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2">This will activate the BDO account.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActivateOpen(false)}>Cancel</Button>
            <Button onClick={handleActivate} className="bg-green-600 hover:bg-green-700" disabled={updateMut.isPending}>
              {updateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Activate BDO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form Settings Dialog */}
      <Dialog open={formSettingsOpen} onOpenChange={setFormSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Form Settings</DialogTitle>
            <DialogDescription>Configure the BDO application form fields.</DialogDescription>
          </DialogHeader>
          <div className="bg-muted rounded-lg p-3 flex items-center gap-3">
            <span className="text-sm text-muted-foreground flex-1 font-mono truncate">{window.location.origin}{import.meta.env.BASE_URL}apply</span>
            <Button size="sm" variant="outline" onClick={copyFormLink}>
              <Copy className="h-3 w-3 mr-1" /> Copy
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href="/apply" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" /> Open
              </a>
            </Button>
          </div>
          {[1, 2, 3].map(step => (
            <div key={step} className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">
                Step {step}: {step === 1 ? 'Personal Information' : step === 2 ? 'Identity & Banking' : 'Experience & Declaration'}
              </h4>
              <div className="space-y-2">
                {formConfig.filter(f => f.step === step).map(field => (
                  <div key={field.key} className="flex items-center justify-between py-1.5">
                    <span className="text-sm font-medium">{field.label}</span>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={field.enabled} onCheckedChange={(checked) => setFormConfig(prev =>
                          prev.map(f => f.key === field.key ? { ...f, enabled: !!checked, required: !!checked ? f.required : false } : f)
                        )} />
                        Show
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={field.required} disabled={!field.enabled} onCheckedChange={(checked) => setFormConfig(prev =>
                          prev.map(f => f.key === field.key ? { ...f, required: !!checked } : f)
                        )} />
                        Required
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <DialogFooter>
            <Button variant="outline" onClick={copyFormLink}><Link2 className="h-4 w-4 mr-2" /> Copy Link</Button>
            <Button onClick={() => setFormSettingsOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
