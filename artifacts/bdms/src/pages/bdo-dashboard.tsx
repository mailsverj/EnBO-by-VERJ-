import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import {
  ArrowRight,
  Banknote,
  BookOpen,
  BriefcaseBusiness,
  CalendarClock,
  CircleDollarSign,
  Loader2,
  Plus,
  RefreshCw,
  Target,
  Trophy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { formatCurrency } from '@/data/mock';
import { useAuth } from '@/store/auth';
import { NewLeadDialog } from '@/components/leads/NewLeadDialog';
import { format } from 'date-fns';

const PIPELINE_GROUPS = [
  { label: 'New', stages: ['New Lead'] },
  { label: 'Discovery', stages: ['Contacted', 'Needs Discovery', 'Load Details Submitted'] },
  { label: 'Design', stages: ['Technical Assessment', 'System Design', 'Design Approval'] },
  { label: 'Commercial', stages: ['Invoice', 'Follow-Up / Negotiation'] },
  { label: 'Won', stages: ['Won'] },
];

export default function BdoDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['leads'],
    queryFn: () => api.leads.list(),
  });

  const leads = data?.leads ?? [];
  const openLeads = leads.filter(lead => lead.stage !== 'Won' && lead.stage !== 'Lost / Nurture');
  const pipelineValue = openLeads.reduce((sum, lead) => sum + lead.value, 0);
  const wonLeads = leads.filter(lead => lead.stage === 'Won');
  const wonValue = wonLeads.reduce((sum, lead) => sum + lead.value, 0);
  const upcomingFollowUps = leads
    .filter(lead => lead.followUpDate && new Date(lead.followUpDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">BDO workspace</p>
            {user?.vbdoId && <Badge variant="outline" className="font-mono">{user.vbdoId}</Badge>}
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Welcome back, {user?.name.split(' ')[0] ?? 'BDO'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Keep your opportunities moving and build trusted customer relationships.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/leads">
            <Button variant="outline">
              Open My Leads <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <NewLeadDialog onCreated={lead => navigate(`/leads/${lead.leadRef}`)}>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Lead
            </Button>
          </NewLeadDialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <Card className="border-destructive/40">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div>
              <h2 className="font-semibold">Your dashboard could not be loaded</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Please try again.'}
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Retry
            </Button>
          </CardContent>
        </Card>
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

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle>My pipeline</CardTitle>
                <p className="text-sm text-muted-foreground">Where your opportunities are currently progressing.</p>
              </CardHeader>
              <CardContent className="space-y-5">
                {PIPELINE_GROUPS.map(group => {
                  const count = leads.filter(lead => group.stages.includes(lead.stage)).length;
                  const percentage = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
                  return (
                    <div key={group.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{group.label}</span>
                        <span className="text-muted-foreground">{count} lead{count === 1 ? '' : 's'}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" /> Upcoming follow-ups
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingFollowUps.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No follow-ups are scheduled yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingFollowUps.map(lead => (
                        <Link
                          key={lead.id}
                          href={`/leads/${lead.leadRef}`}
                          className="flex items-center justify-between gap-4 rounded-md border p-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{lead.customerName}</div>
                            <div className="font-mono text-xs text-muted-foreground">{lead.leadRef}</div>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {format(new Date(lead.followUpDate!), 'MMM d')}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
                <CardContent className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                  <Link href="/leads">
                    <Button variant="outline" className="w-full justify-start">
                      <BriefcaseBusiness className="mr-2 h-4 w-4" /> View pipeline
                    </Button>
                  </Link>
                  <Link href="/commission">
                    <Button variant="outline" className="w-full justify-start">
                      <Banknote className="mr-2 h-4 w-4" /> Commission ledger
                    </Button>
                  </Link>
                  <Link href="/training">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="mr-2 h-4 w-4" /> Training portal
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
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
                <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
                  <div>
                    <h3 className="font-semibold">Start your pipeline</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add your first customer opportunity to begin tracking progress.
                    </p>
                  </div>
                  <NewLeadDialog onCreated={lead => navigate(`/leads/${lead.leadRef}`)}>
                    <Button><Plus className="mr-2 h-4 w-4" /> Create First Lead</Button>
                  </NewLeadDialog>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Follow-up</TableHead>
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
                          <TableCell className="text-sm text-muted-foreground">
                            {lead.followUpDate ? format(new Date(lead.followUpDate), 'MMM d, yyyy') : 'Not scheduled'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {lead.value > 0 ? formatCurrency(lead.value) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}