import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockBdoApplications, mockUsers } from '@/data/mock';
import { format } from 'date-fns';
import { Eye, CheckCircle2, XCircle, RefreshCw, Power, Copy, ExternalLink, Link2, Settings2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export default function BdoApplications() {
  const [apps, setApps] = useState(mockBdoApplications);
  const [selectedApp, setSelectedApp] = useState<typeof mockBdoApplications[0] | null>(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isResubmitOpen, setIsResubmitOpen] = useState(false);
  const [isActivateOpen, setIsActivateOpen] = useState(false);
  const { toast } = useToast();

  const [formSettingsOpen, setFormSettingsOpen] = useState(false);

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

  const updateStatus = (id: string, status: string) => {
    setApps(apps.map(a => a.id === id ? { ...a, status } : a));
    setIsRejectOpen(false);
    setIsResubmitOpen(false);
    setIsActivateOpen(false);
  };

  const handleActivate = () => {
    if (selectedApp) {
      updateStatus(selectedApp.id, 'Activated');
      toast({
        title: 'BDO Account Created',
        description: `${selectedApp.name} has been successfully activated as a BDO.`,
      });
      setSelectedApp(null);
    }
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map(app => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium text-xs text-muted-foreground">{app.id}</TableCell>
                  <TableCell>
                    <div className="font-semibold">{app.name}</div>
                    <div className="text-xs text-muted-foreground">{app.email}</div>
                  </TableCell>
                  <TableCell>{app.location}</TableCell>
                  <TableCell>{format(new Date(app.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(app.status)}`}>
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
        </CardContent>
      </Card>

      <Dialog open={!!selectedApp && !isRejectOpen && !isResubmitOpen && !isActivateOpen} onOpenChange={(o) => !o && setSelectedApp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details: {selectedApp?.name}</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Email</div>
                  <div className="font-medium">{selectedApp.email}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Phone</div>
                  <div className="font-medium">{selectedApp.phone}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Location</div>
                  <div className="font-medium">{selectedApp.location}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Applied On</div>
                  <div className="font-medium">{format(new Date(selectedApp.date), 'MMMM d, yyyy')}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 border-b pb-2">KYC Documents</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4 flex flex-col items-center justify-center bg-muted/30 aspect-video text-muted-foreground text-sm cursor-pointer hover:bg-muted/50 transition-colors">
                    National ID
                  </div>
                  <div className="border rounded-md p-4 flex flex-col items-center justify-center bg-muted/30 aspect-video text-muted-foreground text-sm cursor-pointer hover:bg-muted/50 transition-colors">
                    Utility Bill
                  </div>
                </div>
              </div>

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
                  <Button onClick={() => updateStatus(selectedApp.id, 'KYC Pending')}>
                    Request KYC
                  </Button>
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

      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this application.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Rejection reason..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => selectedApp && updateStatus(selectedApp.id, 'Rejected')}>Confirm Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isResubmitOpen} onOpenChange={setIsResubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Resubmission</DialogTitle>
            <DialogDescription>What needs to be fixed or resubmitted?</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="e.g. Utility bill is blurred..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResubmitOpen(false)}>Cancel</Button>
            <Button onClick={() => selectedApp && updateStatus(selectedApp.id, 'Submitted')}>Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isActivateOpen} onOpenChange={setIsActivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate BDO Account</DialogTitle>
            <DialogDescription>Finalise account creation for {selectedApp?.name}.</DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Generated Username</Label>
                  <Input value={`vbdo.${selectedApp.name.split(' ')[0].toLowerCase()}.${Math.floor(Math.random() * 9000 + 1000)}`} readOnly className="bg-muted" />
                </div>
                <div className="space-y-1">
                  <Label>Temporary Password</Label>
                  <Input value={`VERJ@${Math.floor(Math.random() * 900000 + 100000)}`} readOnly className="bg-muted" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Label>Assigned Engineer</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select supervising engineer" /></SelectTrigger>
                  <SelectContent>
                    {mockUsers.filter(u => u.roles.includes('Engineer') || u.roles.includes('Lead Technical Officer')).map(eng => (
                      <SelectItem key={eng.id} value={eng.id}>{eng.name} ({eng.roles[0]})</SelectItem>
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
              <p className="text-xs text-muted-foreground pt-2">This will create the BDO account and notify them via email and WhatsApp.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActivateOpen(false)}>Cancel</Button>
            <Button onClick={handleActivate} className="bg-green-600 hover:bg-green-700">Activate BDO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={formSettingsOpen} onOpenChange={setFormSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Form Settings</DialogTitle>
            <DialogDescription>Configure the BDO application form fields. Disabled fields won't appear to applicants.</DialogDescription>
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
                        <Checkbox
                          checked={field.enabled}
                          onCheckedChange={(checked) => setFormConfig(prev =>
                            prev.map(f => f.key === field.key ? { ...f, enabled: !!checked, required: !!checked ? f.required : false } : f)
                          )}
                        />
                        Show
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={field.required}
                          disabled={!field.enabled}
                          onCheckedChange={(checked) => setFormConfig(prev =>
                            prev.map(f => f.key === field.key ? { ...f, required: !!checked } : f)
                          )}
                        />
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
            <Button onClick={() => setFormSettingsOpen(false)}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}