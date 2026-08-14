import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockBdos, mockLeads, mockCommissions, formatCurrency } from '@/data/mock';
import { format, differenceInDays } from 'date-fns';
import { useParams, Link } from 'wouter';
import { Mail, Phone, MapPin, Calendar, Cake, ShieldAlert } from 'lucide-react';

export default function BdoProfile() {
  const { id } = useParams();
  const bdo = mockBdos.find(b => b.id === id);

  if (!bdo) {
    return <div className="p-8 text-center text-muted-foreground">BDO not found</div>;
  }

  const bdoLeads = mockLeads.filter(l => l.sourceBdo === id);
  const bdoCommissions = mockCommissions.filter(c => c.bdoId === id);

  const daysToBirthday = differenceInDays(new Date(bdo.birthday), new Date());
  const isBirthdaySoon = daysToBirthday >= 0 && daysToBirthday <= 30;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{bdo.name}</h1>
            <Badge variant="outline" className="font-mono">{bdo.id}</Badge>
            <Badge className={bdo.status === 'Active' ? 'bg-green-600' : 'bg-amber-600'}>{bdo.status}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">BDO Profile & Performance Tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Profile</Button>
          <Button variant="destructive"><ShieldAlert className="h-4 w-4 mr-2" /> Suspend</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Personal Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{bdo.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{bdo.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{bdo.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Joined {format(new Date(bdo.joinedAt), 'MMM d, yyyy')}</span>
            </div>
            <div className={`flex items-center gap-3 text-sm p-2 rounded-md ${isBirthdaySoon ? 'bg-accent/10 text-accent font-medium' : ''}`}>
              <Cake className={`h-4 w-4 ${isBirthdaySoon ? 'text-accent' : 'text-muted-foreground'}`} />
              <span>Birthday: {format(new Date(bdo.birthday), 'MMMM d')}</span>
              {isBirthdaySoon && <Badge variant="default" className="ml-auto text-xs py-0 h-5">Upcoming</Badge>}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Leads</div>
                <div className="text-3xl font-bold">{bdo.leadsCount}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Closed Won</div>
                <div className="text-3xl font-bold">{bdoLeads.filter(l => l.stage === 'Won').length}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Project Value</div>
                <div className="text-2xl font-bold text-primary">{formatCurrency(bdo.totalValue)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Commission Earned</div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(bdo.commissionEarned)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="leads">Leads Pipeline</TabsTrigger>
          <TabsTrigger value="commission">Commission Ledger</TabsTrigger>
        </TabsList>
        <TabsContent value="leads" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bdoLeads.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No leads found for this BDO.</TableCell></TableRow>
                  ) : (
                    bdoLeads.map(lead => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-mono text-xs"><Link href={`/leads/${lead.id}`} className="text-primary hover:underline">{lead.id}</Link></TableCell>
                        <TableCell className="font-medium">{lead.customerName}</TableCell>
                        <TableCell><Badge variant="outline">{lead.stage}</Badge></TableCell>
                        <TableCell>{lead.value > 0 ? formatCurrency(lead.value) : '-'}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{format(new Date(lead.updatedAt), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="commission" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Project Value</TableHead>
                    <TableHead>Commission (3%)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bdoCommissions.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No commissions recorded.</TableCell></TableRow>
                  ) : (
                    bdoCommissions.map(comm => (
                      <TableRow key={comm.id}>
                        <TableCell className="font-mono text-xs">{comm.id}</TableCell>
                        <TableCell className="font-medium">{comm.customerName}</TableCell>
                        <TableCell>{formatCurrency(comm.projectValue)}</TableCell>
                        <TableCell className="font-bold">{formatCurrency(comm.amount)}</TableCell>
                        <TableCell>
                          <Badge className={comm.status === 'Paid' ? 'bg-green-600' : 'bg-amber-500'}>{comm.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{format(new Date(comm.date), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
