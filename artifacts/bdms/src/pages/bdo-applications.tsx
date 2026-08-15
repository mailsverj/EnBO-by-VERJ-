import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import {
  Eye, CheckCircle2, XCircle, RefreshCw, Power, Copy, ExternalLink,
  Link2, Settings2, Loader2, Shield, ClipboardList, User, AlertTriangle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/store/auth';
import { api, type Application } from '@/lib/api';

export default function BdoApplications() {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const qc = useQueryClient();
  const isChiefAdmin = hasRole('Chief Admin');

  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => api.applications.list(),
  });
  const apps = data?.applications ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: ['applications'] });

  const kycMut = useMutation({
    mutationFn: ({ id, kycStatus, notes }: { id: number; kycStatus: string; notes?: string }) =>
      api.applications.updateKyc(id, kycStatus, notes),
    onSuccess: invalidate,
  });
  const shortlistMut = useMutation({
    mutationFn: (id: number) => api.applications.shortlist(id),
    onSuccess: invalidate,
  });
  const activateMut = useMutation({
    mutationFn: (id: number) => api.applications.activate(id),
    onSuccess: invalidate,
  });
  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => api.applications.reject(id, reason),
    onSuccess: invalidate,
  });

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [kycNoteOpen, setKycNoteOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [formSettingsOpen, setFormSettingsOpen] = useState(false);
  const [kycNote, setKycNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [credentials, setCredentials] = useState<{ vbdoId: string; defaultPassword: string } | null>(null);

  const statusColor = (s: string) => {
    if (s === 'Activated') return 'bg-green-100 text-green-800 border-green-200';
    if (s === 'Rejected') return 'bg-red-100 text-red-800 border-red-200';
    if (s === 'Assessment Passed') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (s === 'Assessment Failed') return 'bg-orange-100 text-orange-800 border-orange-200';
    if (s === 'Shortlisted') return 'bg-purple-100 text-purple-800 border-purple-200';
    if (s === 'KYC Verified' || s.includes('KYC')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (s === 'Submitted') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const kycColor = (s: string) => {
    if (s === 'KYC Verified') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'KYC Resubmission Required') return 'bg-red-100 text-red-700 border-red-200';
    if (s === 'KYC Pending') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-gray-100 text-gray-500 border-gray-200';
  };

  const assessColor = (s: string) => {
    if (s === 'Passed') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'Failed') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-500 border-gray-200';
  };

  const copyFormLink = () => {
    const url = window.location.origin + (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/apply';
    navigator.clipboard.writeText(url);
    toast({ title: 'Form link copied!', description: url });
  };

  const copyAssessmentLink = (app: Application) => {
    const url = window.location.origin + (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + `/assessment?ref=${app.refId}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Assessment link copied!', description: `Link for ${app.fullName} copied to clipboard.` });
  };

  const handleKyc = async (status: string) => {
    if (!selectedApp) return;
    if (status === 'KYC Resubmission Required' && !kycNote.trim()) {
      setKycNoteOpen(true);
      return;
    }
    await kycMut.mutateAsync({ id: selectedApp.id, kycStatus: status, notes: kycNote || undefined });
    setKycNote('');
    setKycNoteOpen(false);
    toast({ title: `KYC status → ${status}` });
  };

  const handleShortlist = async () => {
    if (!selectedApp) return;
    await shortlistMut.mutateAsync(selectedApp.id);
    toast({ title: `${selectedApp.fullName} shortlisted`, description: 'Assessment link is now available.' });
    setSelectedApp(null);
  };

  const handleActivate = async () => {
    if (!selectedApp) return;
    try {
      const result = await activateMut.mutateAsync(selectedApp.id);
      setCredentials(result.credentials);
      toast({ title: 'BDO Activated!', description: `${result.credentials.vbdoId} account created.` });
    } catch (e) {
      toast({ title: 'Activation failed', description: (e as Error).message, variant: 'destructive' });
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    await rejectMut.mutateAsync({ id: selectedApp.id, reason: rejectReason });
    setRejectOpen(false);
    setSelectedApp(null);
    setRejectReason('');
    toast({ title: 'Application rejected' });
  };

  const detailOpen = !!selectedApp && !rejectOpen && !activateOpen && !kycNoteOpen;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">BDO Applications</h1>
          <p className="text-muted-foreground mt-1">Manage the full application → KYC → assessment → activation pipeline.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyFormLink}>
            <Link2 className="h-4 w-4 mr-2" /> Copy Form Link
          </Button>
          <Button variant="outline" onClick={() => setFormSettingsOpen(true)}>
            <Settings2 className="h-4 w-4 mr-2" /> Form Links
          </Button>
        </div>
      </div>

      {/* Pipeline legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { label: 'Submitted', cls: 'bg-blue-100 text-blue-800' },
          { label: 'KYC Pending', cls: 'bg-amber-100 text-amber-800' },
          { label: 'KYC Resubmission Required', cls: 'bg-amber-100 text-amber-800' },
          { label: 'Shortlisted', cls: 'bg-purple-100 text-purple-800' },
          { label: 'Assessment Passed', cls: 'bg-emerald-100 text-emerald-800' },
          { label: 'Assessment Failed', cls: 'bg-orange-100 text-orange-800' },
          { label: 'Activated', cls: 'bg-green-100 text-green-800' },
          { label: 'Rejected', cls: 'bg-red-100 text-red-800' },
        ].map(s => (
          <span key={s.label} className={`px-2 py-0.5 rounded-full font-medium border ${s.cls}`}>{s.label}</span>
        ))}
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
                  <TableHead className="w-[100px]">Ref</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Pipeline Status</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Assessment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No applications yet.</TableCell>
                  </TableRow>
                )}
                {apps.map(app => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{app.refId}</TableCell>
                    <TableCell>
                      <div className="font-semibold">{app.fullName}</div>
                      <div className="text-xs text-muted-foreground">{app.email}</div>
                    </TableCell>
                    <TableCell className="text-sm">{app.state}{app.lga ? `, ${app.lga}` : ''}</TableCell>
                    <TableCell className="text-sm">{format(new Date(app.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${statusColor(app.status)}`}>{app.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${kycColor(app.kycStatus)}`}>{app.kycStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      {app.assessmentStatus !== 'Not Started' ? (
                        <div className="space-y-0.5">
                          <Badge variant="outline" className={`text-xs ${assessColor(app.assessmentStatus)}`}>{app.assessmentStatus}</Badge>
                          {app.assessmentScore != null && (
                            <div className="text-xs text-muted-foreground">{app.assessmentScore}/{app.assessmentTotal} ({Math.round((app.assessmentScore / (app.assessmentTotal ?? 1)) * 100)}%)</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
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

      {/* Application Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={(o) => !o && setSelectedApp(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-4 w-4" /> {selectedApp?.fullName}
              <span className="text-xs font-mono text-muted-foreground ml-1">{selectedApp?.refId}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-6">
              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={statusColor(selectedApp.status)}>{selectedApp.status}</Badge>
                <Badge variant="outline" className={kycColor(selectedApp.kycStatus)}>KYC: {selectedApp.kycStatus}</Badge>
                {selectedApp.assessmentStatus !== 'Not Started' && (
                  <Badge variant="outline" className={assessColor(selectedApp.assessmentStatus)}>
                    Assessment: {selectedApp.assessmentStatus}
                    {selectedApp.assessmentScore != null && ` (${selectedApp.assessmentScore}/${selectedApp.assessmentTotal})`}
                  </Badge>
                )}
              </div>

              {/* Personal details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-muted-foreground mb-0.5 text-xs">Email</div><div className="font-medium">{selectedApp.email}</div></div>
                <div><div className="text-muted-foreground mb-0.5 text-xs">Phone</div><div className="font-medium">{selectedApp.phone}</div></div>
                <div><div className="text-muted-foreground mb-0.5 text-xs">Location</div><div className="font-medium">{selectedApp.state}{selectedApp.lga ? `, ${selectedApp.lga}` : ''}</div></div>
                <div><div className="text-muted-foreground mb-0.5 text-xs">Applied</div><div className="font-medium">{format(new Date(selectedApp.createdAt), 'MMMM d, yyyy')}</div></div>
                {selectedApp.education && <div><div className="text-muted-foreground mb-0.5 text-xs">Education</div><div className="font-medium">{selectedApp.education}</div></div>}
                {selectedApp.occupation && <div><div className="text-muted-foreground mb-0.5 text-xs">Occupation</div><div className="font-medium">{selectedApp.occupation}</div></div>}
                {selectedApp.salesExperience && <div><div className="text-muted-foreground mb-0.5 text-xs">Sales Experience</div><div className="font-medium">{selectedApp.salesExperience}</div></div>}
                {selectedApp.nin && <div><div className="text-muted-foreground mb-0.5 text-xs">NIN</div><div className="font-medium font-mono">{selectedApp.nin}</div></div>}
                {selectedApp.bankName && <div className="col-span-2"><div className="text-muted-foreground mb-0.5 text-xs">Banking</div><div className="font-medium">{selectedApp.bankName} — {selectedApp.accountNumber} ({selectedApp.accountName})</div></div>}
                {selectedApp.guarantorName && <div className="col-span-2"><div className="text-muted-foreground mb-0.5 text-xs">Guarantor</div><div className="font-medium">{selectedApp.guarantorName} ({selectedApp.guarantorRelationship}) · {selectedApp.guarantorPhone}</div></div>}
              </div>

              {/* KYC documents */}
              {(selectedApp.photoUrl || selectedApp.idDocumentUrl) && (
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">KYC Documents</div>
                  {selectedApp.photoUrl && (
                    <a href={selectedApp.photoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" /> View Selfie / Passport Photo
                    </a>
                  )}
                  {selectedApp.idDocumentUrl && (
                    <a href={selectedApp.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" /> View Government-issued ID
                    </a>
                  )}
                </div>
              )}

              {selectedApp.statement && (
                <div><div className="text-muted-foreground text-xs mb-1">Personal Statement</div><div className="text-sm border rounded-md p-3 bg-muted/30 leading-relaxed">{selectedApp.statement}</div></div>
              )}

              {selectedApp.adminNotes && (
                <div><div className="text-muted-foreground text-xs mb-1">Admin Notes</div><div className="text-sm border rounded-md p-3 bg-amber-50 text-amber-900 leading-relaxed">{selectedApp.adminNotes}</div></div>
              )}

              {/* Assessment link (after shortlisting) */}
              {selectedApp.status === 'Shortlisted' && selectedApp.assessmentStatus === 'Not Started' && (
                <div className="border rounded-lg p-3 bg-purple-50 border-purple-200 space-y-2">
                  <div className="text-xs font-semibold text-purple-800 uppercase tracking-wider">Assessment Ready</div>
                  <p className="text-sm text-purple-700">This applicant has been shortlisted. Share the assessment link with them.</p>
                  <Button size="sm" variant="outline" className="border-purple-300 text-purple-700" onClick={() => copyAssessmentLink(selectedApp)}>
                    <Copy className="h-3 w-3 mr-2" /> Copy Assessment Link
                  </Button>
                </div>
              )}

              {/* Activated credentials */}
              {selectedApp.status === 'Activated' && selectedApp.generatedUsername && (
                <div className="border rounded-lg p-3 bg-green-50 border-green-200 space-y-1">
                  <div className="text-xs font-semibold text-green-800 uppercase tracking-wider">BDO Account Active</div>
                  <div className="text-sm text-green-700">VBDO ID: <span className="font-mono font-bold">{selectedApp.generatedUsername}</span></div>
                  <div className="text-xs text-green-600">Activated {selectedApp.activatedAt ? format(new Date(selectedApp.activatedAt), 'MMM d, yyyy') : ''}</div>
                </div>
              )}

              {/* Pipeline actions */}
              <div className="flex flex-wrap justify-end gap-2 pt-4 border-t">
                {/* Reject — available unless already done */}
                {!['Rejected', 'Activated'].includes(selectedApp.status) && (
                  <Button variant="destructive" size="sm" onClick={() => setRejectOpen(true)}>
                    <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject
                  </Button>
                )}

                {/* Step 1: Begin KYC */}
                {selectedApp.status === 'Submitted' && (
                  <Button size="sm" variant="outline" onClick={() => handleKyc('KYC Pending')} disabled={kycMut.isPending}>
                    <Shield className="h-3.5 w-3.5 mr-1.5" /> Begin KYC Review
                  </Button>
                )}

                {/* Step 2: KYC actions */}
                {selectedApp.kycStatus === 'KYC Pending' && selectedApp.status !== 'Shortlisted' && !['Assessment Passed','Assessment Failed','Activated'].includes(selectedApp.status) && (
                  <>
                    <Button size="sm" variant="outline" className="border-amber-300 text-amber-700" onClick={() => handleKyc('KYC Resubmission Required')} disabled={kycMut.isPending}>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Request Resubmission
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleKyc('KYC Verified')} disabled={kycMut.isPending}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Mark KYC Verified
                    </Button>
                  </>
                )}

                {/* Step 3: Shortlist (after KYC Verified) */}
                {selectedApp.kycStatus === 'KYC Verified' && !['Shortlisted','Assessment Passed','Assessment Failed','Activated'].includes(selectedApp.status) && (
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={handleShortlist} disabled={shortlistMut.isPending}>
                    <ClipboardList className="h-3.5 w-3.5 mr-1.5" /> Shortlist Applicant
                  </Button>
                )}

                {/* Step 4: Copy assessment link */}
                {selectedApp.status === 'Shortlisted' && (
                  <Button size="sm" variant="outline" onClick={() => copyAssessmentLink(selectedApp)}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Assessment Link
                  </Button>
                )}

                {/* Step 5: Activate (Chief Admin, after assessment passed) */}
                {selectedApp.status === 'Assessment Passed' && isChiefAdmin && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setActivateOpen(true)}>
                    <Power className="h-3.5 w-3.5 mr-1.5" /> Activate BDO
                  </Button>
                )}

                {selectedApp.status === 'Assessment Passed' && !isChiefAdmin && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground border rounded px-3 py-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    Awaiting Chief Admin activation
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* KYC Resubmission Note Dialog */}
      <Dialog open={kycNoteOpen} onOpenChange={setKycNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request KYC Resubmission</DialogTitle>
            <DialogDescription>Specify what needs to be corrected or resubmitted.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="e.g. Selfie is blurred. Please submit a clear photo in good lighting." value={kycNote} onChange={e => setKycNote(e.target.value)} rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setKycNoteOpen(false)}>Cancel</Button>
            <Button onClick={() => selectedApp && kycMut.mutateAsync({ id: selectedApp.id, kycStatus: 'KYC Resubmission Required', notes: kycNote }).then(() => { setKycNoteOpen(false); setKycNote(''); toast({ title: 'KYC resubmission requested' }); })}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>Provide a reason for rejecting {selectedApp?.fullName}'s application.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Rejection reason..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectMut.isPending}>
              {rejectMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Confirm Dialog */}
      <Dialog open={activateOpen} onOpenChange={(o) => { if (!o) { setActivateOpen(false); setCredentials(null); setSelectedApp(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate BDO Account</DialogTitle>
            <DialogDescription>
              {credentials
                ? `Account created for ${selectedApp?.fullName}. Share these credentials.`
                : `You are about to activate ${selectedApp?.fullName} as a VERJ BDO. This will create their account and assign a VBDO ID.`}
            </DialogDescription>
          </DialogHeader>
          {credentials ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">VBDO ID / Username</Label>
                  <Input value={credentials.vbdoId} readOnly className="bg-muted font-mono text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Default Password</Label>
                  <Input value={credentials.defaultPassword} readOnly className="bg-muted font-mono text-sm" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">The BDO can log in with their email and this default password. Advise them to change it on first login.</p>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="notify-email" defaultChecked />
                <Label htmlFor="notify-email" className="font-normal cursor-pointer text-sm">Send welcome email with credentials</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="notify-wa" defaultChecked />
                <Label htmlFor="notify-wa" className="font-normal cursor-pointer text-sm">Send WhatsApp notification</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            {credentials ? (
              <Button onClick={() => { setActivateOpen(false); setCredentials(null); setSelectedApp(null); }}>Done</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setActivateOpen(false)}>Cancel</Button>
                <Button onClick={handleActivate} className="bg-green-600 hover:bg-green-700" disabled={activateMut.isPending}>
                  {activateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Power className="h-4 w-4 mr-2" />}
                  Activate BDO
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form Links Dialog */}
      <Dialog open={formSettingsOpen} onOpenChange={setFormSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>BDO Pipeline Links</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Application Form</Label>
              <div className="bg-muted rounded p-3 flex items-center gap-3">
                <span className="text-xs font-mono flex-1 truncate">{window.location.origin}{import.meta.env.BASE_URL}apply</span>
                <Button size="sm" variant="outline" onClick={copyFormLink}><Copy className="h-3 w-3 mr-1" /> Copy</Button>
                <Button size="sm" variant="outline" asChild><a href="/apply" target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" /></a></Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assessment Portal</Label>
              <div className="bg-muted rounded p-3 flex items-center gap-3">
                <span className="text-xs font-mono flex-1 truncate">{window.location.origin}{import.meta.env.BASE_URL}assessment</span>
                <Button size="sm" variant="outline" onClick={() => { const u = window.location.origin + (import.meta.env.BASE_URL||'/').replace(/\/$/,'') + '/assessment'; navigator.clipboard.writeText(u); toast({ title: 'Copied!' }); }}><Copy className="h-3 w-3 mr-1" /> Copy</Button>
                <Button size="sm" variant="outline" asChild><a href="/assessment" target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" /></a></Button>
              </div>
              <p className="text-xs text-muted-foreground">Applicants enter their APP reference on this page. Share individual links from within each applicant's detail view after shortlisting.</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setFormSettingsOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
