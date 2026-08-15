import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency, mockFinanceMonths, mockExpenses } from '@/data/mock';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUpRight, TrendingUp, Badge } from 'lucide-react';
import { format } from 'date-fns';

const COLORS = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)'];

export default function Finance() {
  const [period, setPeriod] = useState('6m');

  const bdoRevenueData = [
    { name: 'VBDO-0001', value: 45000000 },
    { name: 'VBDO-0002', value: 28000000 },
    { name: 'VBDO-0004', value: 5000000 },
  ];

  const currentMonthData = mockFinanceMonths[mockFinanceMonths.length - 1];
  const grossMargin = (currentMonthData.grossProfit / currentMonthData.revenue) * 100;
  const netMargin = (currentMonthData.netProfit / currentMonthData.revenue) * 100;

  const expenseByCategory = mockExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const expensePieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting</h1>
          <p className="text-muted-foreground mt-1">High-level P&L, expenses tracking, and financial insights.</p>
        </div>
      </div>

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
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Revenue (Current)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(currentMonthData.revenue)}</div>
                <div className="text-xs text-green-600 mt-1 flex items-center"><ArrowUpRight className="h-3 w-3 mr-1"/> 10.1% vs last month</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">COGS (Current)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(currentMonthData.cogs)}</div>
                <div className="text-xs text-muted-foreground mt-1">Includes BDO commissions</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Gross Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(currentMonthData.grossProfit)}</div>
                <div className="text-xs font-medium text-green-600 mt-1">{grossMargin.toFixed(1)}% Margin</div>
              </CardContent>
            </Card>
            <Card className="bg-primary text-primary-foreground border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(currentMonthData.netProfit)}</div>
                <div className="text-xs text-primary-foreground/70 mt-1">{netMargin.toFixed(1)}% Net Margin</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue vs COGS Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockFinanceMonths.slice(-6)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `₦${val/1000000}M`} />
                    <RechartsTooltip 
                      formatter={(val: number) => formatCurrency(val)}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }}
                    />
                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="cogs" name="Costs" stroke="var(--color-chart-4)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Revenue by BDO (Top 3)</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bdoRevenueData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => `₦${val/1000000}M`} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <RechartsTooltip 
                      formatter={(val: number) => formatCurrency(val)}
                      cursor={{ fill: 'var(--color-muted)' }} 
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }} 
                    />
                    <Bar dataKey="value" name="Revenue" fill="var(--color-chart-2)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Operating Expenses</h2>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Expense</Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total OPEX (Last 30 Days)</div>
                  <div className="text-3xl font-bold">{formatCurrency(mockExpenses.reduce((sum, e) => sum + e.amount, 0))}</div>
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
                  <div className="text-3xl font-bold">Payroll</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{formatCurrency(4200000)}</div>
                  <div className="text-xs text-muted-foreground">81% of total</div>
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
                  {mockExpenses.map(exp => (
                    <TableRow key={exp.id}>
                      <TableCell className="text-sm">{format(new Date(exp.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell><Badge variant="outline" className="font-normal">{exp.category}</Badge></TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{exp.description}</div>
                        {exp.notes && <div className="text-xs text-muted-foreground mt-0.5">{exp.notes}</div>}
                      </TableCell>
                      <TableCell className="text-sm">{exp.vendor}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{exp.createdBy}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(exp.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pnl" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Profit & Loss Statement</h2>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="12m">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    {mockFinanceMonths.slice(period === '12m' ? 0 : period === '6m' ? -6 : period === '3m' ? -3 : -1).map(m => (
                      <TableHead key={m.month} className="text-right">{m.month}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold bg-muted/30">Revenue</TableCell>
                    {mockFinanceMonths.slice(period === '12m' ? 0 : period === '6m' ? -6 : period === '3m' ? -3 : -1).map(m => (
                      <TableCell key={m.month} className="text-right font-medium">{formatCurrency(m.revenue)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground pl-8">Cost of Goods Sold (COGS)</TableCell>
                    {mockFinanceMonths.slice(period === '12m' ? 0 : period === '6m' ? -6 : period === '3m' ? -3 : -1).map(m => (
                      <TableCell key={m.month} className="text-right text-muted-foreground">- {formatCurrency(m.cogs)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="border-y-2 border-primary/20">
                    <TableCell className="font-bold">Gross Profit</TableCell>
                    {mockFinanceMonths.slice(period === '12m' ? 0 : period === '6m' ? -6 : period === '3m' ? -3 : -1).map(m => (
                      <TableCell key={m.month} className="text-right font-bold text-green-600">
                        {formatCurrency(m.grossProfit)}
                        <span className="block text-xs font-normal text-muted-foreground">{((m.grossProfit/m.revenue)*100).toFixed(1)}%</span>
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground pl-8">Operating Expenses (OPEX)</TableCell>
                    {mockFinanceMonths.slice(period === '12m' ? 0 : period === '6m' ? -6 : period === '3m' ? -3 : -1).map(m => (
                      <TableCell key={m.month} className="text-right text-muted-foreground">- {formatCurrency(m.opex)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="bg-primary/5">
                    <TableCell className="font-bold text-primary text-lg">Net Profit</TableCell>
                    {mockFinanceMonths.slice(period === '12m' ? 0 : period === '6m' ? -6 : period === '3m' ? -3 : -1).map(m => (
                      <TableCell key={m.month} className="text-right font-bold text-primary text-lg">
                        {formatCurrency(m.netProfit)}
                        <span className="block text-xs font-normal opacity-70">{((m.netProfit/m.revenue)*100).toFixed(1)}%</span>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>12-Month Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockFinanceMonths} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000000}M`} />
                    <RechartsTooltip formatter={(val: number) => formatCurrency(val)} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}