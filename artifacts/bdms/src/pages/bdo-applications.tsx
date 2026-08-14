import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockBdoApplications } from '@/data/mock';
import { format } from 'date-fns';
import { Eye, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function BdoApplications() {
  const [apps, setApps] = useState(mockBdoApplications);
  const [selectedApp, setSelectedApp] = useState<typeof mockBdoApplications[0] | null>(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isResubmitOpen, setIsResubmitOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'KYC Pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Shortlisted': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateStatus = (id: string, status: string) => {
    setApps(apps.map(a => a.id === id ? { ...a, status } : a));
    setIsRejectOpen(false);
    setIsResubmitOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">BDO Applications</h1>
          <p className="text-muted-foreground mt-1">Review and process prospective Business Development Officers.</p>
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
                    <Badge variant="secondary" className={`hover:bg-transparent ${getStatusColor(app.status)}`}>
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

      <Dialog open={!!selectedApp && !isRejectOpen && !isResubmitOpen} onOpenChange={() => setSelectedApp(null)}>
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
                {selectedApp.status !== 'Rejected' && (
                  <Button variant="destructive" onClick={() => setIsRejectOpen(true)}>
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                )}
                {selectedApp.status !== 'Submitted' && selectedApp.status !== 'Rejected' && (
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
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(selectedApp.id, 'Shortlisted')}>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Approve & Shortlist
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
    </div>
  );
}
