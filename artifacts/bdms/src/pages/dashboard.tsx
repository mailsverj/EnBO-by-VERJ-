import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { formatCurrency } from '@/data/mock';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Activity, Users, Zap, Briefcase, FileSpreadsheet, Wallet, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Dashboard() {
  const { data: bdosData, isLoading: bdosLoading } = useQuery({
    queryKey: ['bdos'],
    queryFn: () => api.bdos.list(),
  });
  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => api.leads.list(),
  });
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.invoices.list(),
  });
  const { data: commissionsData, isLoading: commissionsLoading } = useQuery({
    queryKey: ['commissions'],
    queryFn: () => api.commissions.list(),
  });

  const isLoading = bdosLoading || leadsLoading || invoicesLoading || commissionsLoading;

  const bdos = bdosData?.bdos ?? [];
  const leads = leadsData?.leads ?? [];
  const invoices = invoicesData?.invoices ?? [];
  const commissions = commissionsData?.commissions ?? [];

  const activeBdos = bdos.filter(b => b.status === 'Active').length;
  const openLeads = leads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost / Nurture').length;
  const pipelineValue = leads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost / Nurture').reduce((sum, l) => sum + l.value, 0);
  const outstandingInvoices = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled').length;
  const commissionLiability = commissions.filter(c => c.status === 'Pending').reduce((sum, c) => sum + c.amount, 0);
  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0);

  const funnelData = [
    { name: 'New', count: leads.filter(l => l.stage === 'New Lead').length },
    { name: 'Contacted', count: leads.filter(l => l.stage === 'Contacted').length },
    { name: 'Design', count: leads.filter(l => l.stage === 'System Design').length },
    { name: 'Invoice', count: leads.filter(l => l.stage === 'Invoice').length },
    { name: 'Won', count: leads.filter(l => l.stage === 'Won').length },
  ];

  const topBdos = [...bdos].sort((a, b) => b.totalValue - a.totalValue).slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
        <p className="text-muted-foreground mt-1">Operational command centre overview.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Revenue</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active BDOs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeBdos}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Open Leads</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openLeads}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pipeline</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(pipelineValue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Unpaid Inv.</CardTitle>
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{outstandingInvoices}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Comm. Due</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(commissionLiability)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Sales Funnel Summary</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <RechartsTooltip cursor={{ fill: 'var(--color-muted)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing BDOs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>BDO</TableHead>
                      <TableHead>Leads</TableHead>
                      <TableHead className="text-right">Project Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topBdos.map(bdo => (
                      <TableRow key={bdo.id}>
                        <TableCell className="font-medium">
                          <div>{bdo.name}</div>
                          <div className="text-xs text-muted-foreground">{bdo.vbdoId}</div>
                        </TableCell>
                        <TableCell>{bdo.leadsCount}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(bdo.totalValue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
