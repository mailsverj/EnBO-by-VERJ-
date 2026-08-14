import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Calculator as CalcIcon, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockLeads } from '@/data/mock';

interface Appliance {
  id: string;
  name: string;
  qty: number;
  wattage: number;
  hours: number;
}

export default function EngineeringCalculator() {
  const [appliances, setAppliances] = useState<Appliance[]>([
    { id: '1', name: 'Lighting', qty: 10, wattage: 15, hours: 12 },
    { id: '2', name: 'Television', qty: 2, wattage: 120, hours: 8 },
    { id: '3', name: 'Refrigerator', qty: 1, wattage: 150, hours: 24 }
  ]);

  const addAppliance = () => {
    setAppliances([...appliances, { id: Date.now().toString(), name: '', qty: 1, wattage: 0, hours: 0 }]);
  };

  const updateAppliance = (id: string, field: keyof Appliance, value: string | number) => {
    setAppliances(appliances.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeAppliance = (id: string) => {
    setAppliances(appliances.filter(a => a.id !== id));
  };

  // Calculations
  const totalPower = appliances.reduce((sum, a) => sum + (a.qty * a.wattage), 0);
  const totalEnergy = appliances.reduce((sum, a) => sum + (a.qty * a.wattage * a.hours), 0);
  
  const recommendedInverter = totalPower * 1.25; // 25% safety margin
  const recommendedBattery = (totalEnergy * 1.5) / 1000; // kWh, 50% extra for Depth of Discharge
  const recommendedPV = (totalEnergy / 4) / 1000; // kWp, assuming 4 peak sun hours

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Calculator</h1>
          <p className="text-muted-foreground mt-1">Compute load requirements and specify equipment.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Load Template</Button>
          <Button><Save className="h-4 w-4 mr-2" /> Save Design</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Load Profile</CardTitle>
              <CardDescription>Enter appliances to calculate total energy demand.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Appliance</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Watts (W)</TableHead>
                    <TableHead>Hours/Day</TableHead>
                    <TableHead className="text-right">Total Wh</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appliances.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <Input value={app.name} onChange={(e) => updateAppliance(app.id, 'name', e.target.value)} placeholder="e.g. AC" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" min="1" value={app.qty || ''} onChange={(e) => updateAppliance(app.id, 'qty', parseInt(e.target.value) || 0)} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" min="0" value={app.wattage || ''} onChange={(e) => updateAppliance(app.id, 'wattage', parseInt(e.target.value) || 0)} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" min="0" max="24" value={app.hours || ''} onChange={(e) => updateAppliance(app.id, 'hours', parseInt(e.target.value) || 0)} />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {app.qty * app.wattage * app.hours}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeAppliance(app.id)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button variant="outline" size="sm" onClick={addAppliance} className="mt-4 w-full border-dashed">
                <Plus className="h-4 w-4 mr-2" /> Add Row
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-primary/5 pb-4 border-b">
              <CardTitle className="flex items-center gap-2">
                <CalcIcon className="h-5 w-5 text-primary" /> Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Peak Load</div>
                  <div className="text-2xl font-bold">{totalPower.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">W</span></div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Daily Energy</div>
                  <div className="text-2xl font-bold">{totalEnergy.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">Wh</span></div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-dashed border-border">
                <h4 className="text-sm font-semibold">Recommended Sizing</h4>
                
                <div className="flex justify-between items-center bg-muted/40 p-3 rounded-md border">
                  <span className="text-sm font-medium">Inverter Size</span>
                  <span className="font-bold text-primary">{(recommendedInverter / 1000).toFixed(1)} kVA</span>
                </div>
                
                <div className="flex justify-between items-center bg-muted/40 p-3 rounded-md border">
                  <span className="text-sm font-medium">Battery Bank</span>
                  <span className="font-bold text-primary">{recommendedBattery.toFixed(1)} kWh</span>
                </div>
                
                <div className="flex justify-between items-center bg-muted/40 p-3 rounded-md border">
                  <span className="text-sm font-medium">PV Array</span>
                  <span className="font-bold text-primary">{recommendedPV.toFixed(1)} kWp</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Link to Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Open Lead</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a lead..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockLeads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost / Nurture').map(lead => (
                        <SelectItem key={lead.id} value={lead.id}>{lead.id} - {lead.customerName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
