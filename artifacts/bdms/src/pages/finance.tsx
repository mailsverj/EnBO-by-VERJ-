import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/data/mock';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Finance() {
  const financeData = [
    { month: 'Jan', revenue: 45000000, costs: 31500000 },
    { month: 'Feb', revenue: 52000000, costs: 36000000 },
    { month: 'Mar', revenue: 48000000, costs: 33600000 },
    { month: 'Apr', revenue: 61000000, costs: 42000000 },
    { month: 'May', revenue: 59000000, costs: 40500000 },
    { month: 'Jun', revenue: 65000000, costs: 45000000 },
  ];

  const bdoRevenueData = [
    { name: 'VBDO-0001', value: 45000000 },
    { name: 'VBDO-0002', value: 28000000 },
    { name: 'VBDO-0004', value: 5000000 },
  ];

  const currentMonthData = financeData[financeData.length - 1];
  const grossProfit = currentMonthData.revenue - currentMonthData.costs;
  const grossMargin = (grossProfit / currentMonthData.revenue) * 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Analysis</h1>
          <p className="text-muted-foreground mt-1">High-level P&L, revenue tracking, and margin analysis.</p>
        </div>
        <Select defaultValue="6m">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Revenue (Jun)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(currentMonthData.revenue)}</div>
            <div className="text-xs text-green-600 mt-1">↑ 10.1% vs last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">COGS (Jun)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonthData.costs)}</div>
            <div className="text-xs text-muted-foreground mt-1">Includes 3% BDO commission</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Gross Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(grossProfit)}</div>
            <div className="text-xs font-medium text-green-600 mt-1">{grossMargin.toFixed(1)}% Margin</div>
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(78500000)}</div>
            <div className="text-xs text-primary-foreground/70 mt-1">Capital tied in stock</div>
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
              <LineChart data={financeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `₦${val/1000000}M`} />
                <RechartsTooltip 
                  formatter={(val: number) => formatCurrency(val)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="costs" name="Costs" stroke="var(--color-chart-4)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
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
    </div>
  );
}
