import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { formatCurrency } from '@/data/mock';
import { Search, Plus, List, LayoutGrid, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NewLeadDialog } from '@/components/leads/NewLeadDialog';
import { useAuth } from '@/store/auth';
import { useLocation } from 'wouter';

const FUNNEL_STAGES = [
  'New Lead', 'Contacted', 'Needs Discovery', 'Load Details Submitted',
  'Technical Assessment', 'System Design', 'Design Approval',
  'Invoice', 'Follow-Up / Negotiation', 'Won', 'Lost / Nurture'
];

export default function Leads() {
  const [view, setView] = useState<'board' | 'table'>('board');
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const canCreateLead = user?.roles.some(role =>
    ['BDO', 'Chief Admin', 'Super Admin', 'Management', 'Sales Admin'].includes(role),
  ) ?? false;

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['leads'],
    queryFn: () => api.leads.list(),
  });

  const leads = data?.leads ?? [];

  const filteredLeads = leads.filter(l =>
    l.customerName.toLowerCase().includes(search.toLowerCase()) ||
    l.leadRef.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads Pipeline</h1>
          <p className="text-muted-foreground mt-1">Track and manage sales opportunities.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export</Button>
          {canCreateLead && (
            <NewLeadDialog onCreated={lead => navigate(`/leads/${lead.leadRef}`)}>
              <Button><Plus className="h-4 w-4 mr-2" /> New Lead</Button>
            </NewLeadDialog>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Tabs value={view} onValueChange={(v: any) => setView(v)} className="w-auto">
          <TabsList>
            <TabsTrigger value="board"><LayoutGrid className="h-4 w-4 mr-2" /> Board</TabsTrigger>
            <TabsTrigger value="table"><List className="h-4 w-4 mr-2" /> Table</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <Card className="shrink-0 border-destructive/40">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div>
              <h2 className="font-semibold">Leads could not be loaded</h2>
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
      ) : filteredLeads.length === 0 ? (
        <Card className="shrink-0">
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <div>
              <h2 className="font-semibold">{search ? 'No matching leads' : 'No leads yet'}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {search ? 'Try a different customer name or lead ID.' : 'Create the first opportunity to start the pipeline.'}
              </p>
            </div>
            {!search && canCreateLead && (
              <NewLeadDialog onCreated={lead => navigate(`/leads/${lead.leadRef}`)}>
                <Button><Plus className="mr-2 h-4 w-4" /> New Lead</Button>
              </NewLeadDialog>
            )}
            {search && <Button variant="outline" onClick={() => setSearch('')}>Clear search</Button>}
          </CardContent>
        </Card>
      ) : view === 'board' ? (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 min-h-[500px] h-full items-start w-max">
            {FUNNEL_STAGES.map(stage => {
              const stageLeads = filteredLeads.filter(l => l.stage === stage);
              return (
                <div key={stage} className="w-[300px] shrink-0 flex flex-col max-h-full bg-muted/30 rounded-lg border">
                  <div className="p-3 border-b bg-card rounded-t-lg flex items-center justify-between sticky top-0">
                    <h3 className="font-semibold text-sm truncate pr-2">{stage}</h3>
                    <Badge variant="secondary" className="rounded-full">{stageLeads.length}</Badge>
                  </div>
                  <div className="p-2 space-y-2 overflow-y-auto flex-1">
                    {stageLeads.map(lead => (
                      <Link key={lead.id} href={`/leads/${lead.leadRef}`}>
                        <Card className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm">
                          <CardContent className="p-3 space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="font-mono text-xs text-muted-foreground">{lead.leadRef}</span>
                              <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 rounded">{lead.sourceBdoId}</span>
                            </div>
                            <div className="font-medium text-sm line-clamp-1">{lead.customerName}</div>
                            {lead.value > 0 && <div className="text-xs font-semibold">{formatCurrency(lead.value)}</div>}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="text-center py-6 text-xs text-muted-foreground border-2 border-dashed rounded-lg border-muted">
                        No leads in this stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="shrink-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Source BDO</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map(lead => (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      <Link href={`/leads/${lead.leadRef}`}>{lead.leadRef}</Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/leads/${lead.leadRef}`}>{lead.customerName}</Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{lead.sourceBdoId}</TableCell>
                    <TableCell><Badge variant="outline">{lead.stage}</Badge></TableCell>
                    <TableCell className="text-right font-medium">{lead.value > 0 ? formatCurrency(lead.value) : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
