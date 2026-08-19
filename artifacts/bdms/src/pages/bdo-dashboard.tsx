import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { BriefcaseBusiness, CircleDollarSign, Loader2, Target, Trophy, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { formatCurrency } from '@/data/mock';
import { useAuth } from '@/store/auth';

export default function BdoDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => api.leads.list(),
  });

  const leads = data?.leads ?? [];
  const openLeads = leads.filter(lead => lead.stage !== 'Won' && lead.stage !== 'Lost / Nurture');
  const pipelineValue = openLeads.reduce((sum, lead) => sum + lead.value, 0);
  const wonLeads = leads.filter(lead => lead.stage === 'Won');
  const wonValue = wonLeads.reduce((sum, lead) => sum + lead.value, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">BDO workspace</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Welcome back, {user?.name.split(' ')[0] ?? 'BDO'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Keep your opportunities moving and build trusted customer relationships.
          </p>
        </div>
        <Link href="/leads">
          <Button>
            Open My Leads <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">My Leads</CardTitle>
                <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{leads.length}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Opportunities</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{openLeads.length}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pipeline Value</CardTitle>
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{formatCurrency(pipelineValue)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Won Value</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{formatCurrency(wonValue)}</div></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Recent opportunities</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Your latest leads and their current stage.</p>
              </div>
              <Link href="/leads">
                <Button variant="outline" size="sm">View pipeline</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {leads.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                  You do not have any leads yet. Add your first opportunity from the Leads Pipeline.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.slice(0, 5).map(lead => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-mono text-xs font-semibold text-primary">
                          <Link href={`/leads/${lead.leadRef}`}>{lead.leadRef}</Link>
                        </TableCell>
                        <TableCell className="font-medium">{lead.customerName}</TableCell>
                        <TableCell><Badge variant="outline">{lead.stage}</Badge></TableCell>
                        <TableCell className="text-right font-medium">
                          {lead.value > 0 ? formatCurrency(lead.value) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}