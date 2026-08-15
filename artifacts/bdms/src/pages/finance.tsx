import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api, type FinanceSummary, type Expense } from '@/lib/api';
import { formatCurrency } from '@/data/mock';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowUpRight, TrendingUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const COLORS = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)'];

export default function Finance() {
  const [period, setPeriod] = useState('6m');
  const queryClient = useQueryClient();

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['finance-summary'],
    queryFn: () => api.finance.summary(),
  });

  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => api.expenses.list(),
  });

  const addExpenseMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.expenses.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });

  const isLoading = summaryLoading || expensesLoading;

  const summary = summaryData;
  const expenses = expensesData?.expenses ?? [];

  const expenseByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const expensePieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
  const totalOpex = expenses.reduce((sum, e) => sum + e.amount, 0);

  const topExpenseCategory = expensePieData.length > 0
    ? expensePieData.sort((a, b) => b.value - a.value)[0]
    : null;

  // Build monthly trend from recentInvoices for the chart
  const revenueChartData = summary ? [
    { month: 'Current', revenue: summary.totalRevenue, cogs: summary.totalExpenses }
  ] : [];

  const bdoRevenueData = [
    { name: 'BDOs', value: summary?.totalRevenue ?? 0 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting</h1>
          <p className="text-muted-foreground mt-1">High-level P&L, expenses tracking, and financial insights.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="pnl">P&L Report</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(summary?.totalRevenue ?? 0)}</div>
                  <div className="text-xs text-muted-foreground mt-1">All-time paid invoices</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Receivables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(summary?.totalReceivables ?? 0)}</div>
                  <div className="text-xs text-muted-foreground mt-1">Outstanding invoices</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Gross Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(summary?.grossProfit ?? 0)}</div>
                  <div className="text-xs font-medium text-green-600 mt-1">
                    {summary && summary.totalRevenue > 0
                      ? `${((summary.grossProfit / summary.totalRevenue) * 100).toFixed(1)}% Margin`
                      : '0.0% Margin'}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-primary text-primary-foreground border-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">Net Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(summary?.netProfit ?? 0)}</div>
                  <div className="text-xs text-primary-foreground/70 mt-1">
                    {summary && summary.totalRevenue > 0
                      ? `${((summary.netProfit / summary.totalRevenue) * 100).toFixed(1)}% Net Margin`
                      : '0.0% Net Margin'}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Commission Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Commissions Paid</span>
                    <span className="font-bold text-green-600">{formatCurrency(summary?.commissionsPaid ?? 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Commissions Pending</span>
                    <span className="font-bold text-amber-600">{formatCurrency(summary?.commissionsPending ?? 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Total Invoices</span>
                    <span className="font-bold">{summary?.invoiceCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">Paid Invoices</span>
                    <span className="font-bold text-green-600">{summary?.paidInvoiceCount ?? 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(summary?.recentInvoices ?? []).slice(0, 5).map(inv => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono text-xs">{inv.invoiceRef}</TableCell>
                          <TableCell className="text-sm">{inv.customerName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={inv.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                              {inv.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(inv.total)}</TableCell>
                        </TableRow>
                      ))}
                      {(summary?.recentInvoices ?? []).length === 0 && (
                        <TableRow><TableCell colSpan={4} className="text-center py-4 text-muted-foreground text-sm">No invoices yet.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Operating Expenses</h2>
              <Button onClick={() => addExpenseMutation.mutate({ date: new Date().toISOString(), category: 'Other', description: 'New Expense', amount: 0 })}>
                <Plus className="h-4 w-4 mr-2" /> Add Expense
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Total OPEX</div>
                    <div className="text-3xl font-bold">{formatCurrency(totalOpex)}</div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Top Category</div>
                    <div className="text-3xl font-bold">{topExpenseCategory?.name ?? '—'}</div>
                  </div>
                  <div className="text-right">
                    {topExpenseCategory && (
                      <>
                        <div className="text-sm font-semibold">{formatCurrency(topExpenseCategory.value)}</div>
                        <div className="text-xs text-muted-foreground">
                          {totalOpex > 0 ? `${((topExpenseCategory.value / totalOpex) * 100).toFixed(0)}% of total` : ''}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Added By</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No expenses recorded.</TableCell></TableRow>
                    ) : (
                      expenses.map(exp => (
                        <TableRow key={exp.id}>
                          <TableCell className="text-sm">{format(new Date(exp.date), 'MMM d, yyyy')}</TableCell>
                          <TableCell><Badge variant="outline" className="font-normal">{exp.category}</Badge></TableCell>
                          <TableCell>
                            <div className="font-medium text-sm">{exp.description}</div>
                            {exp.notes && <div className="text-xs text-muted-foreground mt-0.5">{exp.notes}</div>}
                          </TableCell>
                          <TableCell className="text-sm">{exp.vendor}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{exp.createdByName}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(exp.amount)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pnl" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Profit & Loss Statement</h2>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="font-semibold bg-muted/30 px-2 py-1 rounded">Revenue</span>
                    <span className="font-medium">{formatCurrency(summary?.totalRevenue ?? 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b pl-8">
                    <span className="text-muted-foreground">Total Expenses (COGS + OPEX)</span>
                    <span className="text-muted-foreground">- {formatCurrency(summary?.totalExpenses ?? 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-y-2 border-primary/20">
                    <span className="font-bold">Gross Profit</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(summary?.grossProfit ?? 0)}
                      {summary && summary.totalRevenue > 0 && (
                        <span className="block text-xs font-normal text-muted-foreground text-right">
                          {((summary.grossProfit / summary.totalRevenue) * 100).toFixed(1)}%
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-primary/5 px-3 rounded-lg">
                    <span className="font-bold text-primary text-lg">Net Profit</span>
                    <span className="font-bold text-primary text-lg">
                      {formatCurrency(summary?.netProfit ?? 0)}
                      {summary && summary.totalRevenue > 0 && (
                        <span className="block text-xs font-normal opacity-70 text-right">
                          {((summary.netProfit / summary.totalRevenue) * 100).toFixed(1)}%
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Expenses</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Revenue', value: summary?.totalRevenue ?? 0 },
                      { name: 'Expenses', value: summary?.totalExpenses ?? 0 },
                      { name: 'Gross Profit', value: summary?.grossProfit ?? 0 },
                      { name: 'Net Profit', value: summary?.netProfit ?? 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₦${val / 1000000}M`} />
                      <RechartsTooltip formatter={(val: number) => formatCurrency(val)} />
                      <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  {expensePieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={expensePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                          {expensePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(val: number) => formatCurrency(val)} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-muted-foreground text-sm">No expense data available.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
