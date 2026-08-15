import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Calculator as CalcIcon, Save, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';

interface Appliance {
  id: string;
  name: string;
  qty: number;
  wattage: number;
  hoursDay: number;
  hoursNight: number;
}

export default function EngineeringCalculator() {
  const { canSeePrices } = useAuth();
  const [appliances, setAppliances] = useState<Appliance[]>([
    { id: '1', name: 'Lighting', qty: 10, wattage: 15, hoursDay: 12, hoursNight: 12 },
    { id: '2', name: 'Television', qty: 2, wattage: 120, hoursDay: 8, hoursNight: 4 },
    { id: '3', name: 'Refrigerator', qty: 1, wattage: 150, hoursDay: 12, hoursNight: 12 }
  ]);
  const [selectedInverterSku, setSelectedInverterSku] = useState('');
  const [selectedBatterySku, setSelectedBatterySku] = useState('');
  const [selectedBatteryQty, setSelectedBatteryQty] = useState<number | ''>('');
  const [selectedPanelSku, setSelectedPanelSku] = useState('');
  const [selectedPanelQty, setSelectedPanelQty] = useState<number | ''>('');
  const [manualInverterOverride, setManualInverterOverride] = useState(false);
  const [linkedLeadId, setLinkedLeadId] = useState('');

  const [pvCableSize, setPvCableSize] = useState('6mm²');
  const [pvCableLength, setPvCableLength] = useState<number | ''>(50);
  const [acCableSize, setAcCableSize] = useState('16mm²');
  const [acCableLength, setAcCableLength] = useState<number | ''>(20);
  const [batCableSize, setBatCableSize] = useState('50mm²');
  const [batCableLength, setBatCableLength] = useState<number | ''>(5);

  const addAppliance = () => {
    setAppliances([...appliances, { id: Date.now().toString(), name: '', qty: 1, wattage: 0, hoursDay: 0, hoursNight: 0 }]);
  };

  const updateAppliance = (id: string, field: keyof Appliance, value: string | number) => {
    setAppliances(appliances.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeAppliance = (id: string) => {
    setAppliances(appliances.filter(a => a.id !== id));
  };

  // Calculations
  const totalLoad = appliances.reduce((sum, a) => sum + (a.qty * a.wattage), 0);
  const totalDayEnergy = appliances.reduce((sum, a) => sum + (a.qty * a.wattage * a.hoursDay), 0);
  const totalNightEnergy = appliances.reduce((sum, a) => sum + (a.qty * a.wattage * a.hoursNight), 0);

  function getRequiredInverterKW(loadW: number): number {
    if (loadW <= 500) return 4;
    if (loadW <= 3000) return 6;
    if (loadW <= 6000) return 12;
    if (loadW <= 12000) return 24;
    if (loadW <= 24000) return 48;
    return 96;
  }

  const batteryWh = totalNightEnergy * 1.25;
  const batteryKWh = batteryWh / 1000;

  function selectBatteryConfig(requiredKWh: number): { moduleKWh: number; qty: number } {
    const tiers = [5, 10, 16, 32, 48];
    for (const tier of tiers) {
      if (requiredKWh <= tier) return { moduleKWh: tier, qty: 1 };
    }
    const moduleSize = 16;
    return { moduleKWh: moduleSize, qty: Math.ceil(requiredKWh / moduleSize) };
  }
  const batteryConfig = selectBatteryConfig(batteryKWh);
  const pvKWp = ((batteryConfig.moduleKWh * batteryConfig.qty / 6) + (totalLoad / 1000)) * 1.67;

  let requiredInverterKW = getRequiredInverterKW(totalLoad);
  while (pvKWp > requiredInverterKW) {
    if (requiredInverterKW === 4) requiredInverterKW = 6;
    else if (requiredInverterKW === 6) requiredInverterKW = 12;
    else if (requiredInverterKW === 12) requiredInverterKW = 24;
    else if (requiredInverterKW === 24) requiredInverterKW = 48;
    else if (requiredInverterKW === 48) requiredInverterKW = 96;
    else break;
  }

  const { data: inventoryData } = useQuery({ queryKey: ['inventory'], queryFn: () => api.inventory.list() });
  const { data: leadsData } = useQuery({ queryKey: ['leads'], queryFn: () => api.leads.list() });
  const allInventory = inventoryData?.inventory ?? [];
  const allLeads = leadsData?.leads ?? [];
  const inverters = useMemo(() => allInventory.filter(i => i.category === 'Inverter'), [allInventory]);
  const batteries = useMemo(() => allInventory.filter(i => i.category === 'Battery'), [allInventory]);
  const panels = useMemo(() => allInventory.filter(i => i.category === 'Solar Panel'), [allInventory]);

  const { autoInverter, autoBattery, defaultAutoBatteryQty, autoPanel, defaultAutoPanelQty } = useMemo(() => {
    const suitableInverters = inverters
      .filter(i => (i.capacityKw ?? 0) >= requiredInverterKW && (i.capacityKw ?? 0) - requiredInverterKW <= 5)
      .sort((a, b) => (a.capacityKw ?? 0) - (b.capacityKw ?? 0));
    const autoInverter = suitableInverters[0] || null;

    const autoBattery = batteries
      .filter(b => (b.capacityKwh ?? 0) >= batteryConfig.moduleKWh * 0.8)
      .sort((a, b) => Math.abs((a.capacityKwh ?? 0) - batteryConfig.moduleKWh) - Math.abs((b.capacityKwh ?? 0) - batteryConfig.moduleKWh))[0]
      || batteries.sort((a, b) => (b.capacityKwh ?? 0) - (a.capacityKwh ?? 0))[0];
    const defaultAutoBatteryQty = batteryConfig.qty;

    const autoPanel = panels.sort((a, b) => (b.capacityW ?? 0) - (a.capacityW ?? 0))[0];
    const defaultAutoPanelQty = autoPanel ? Math.ceil((pvKWp * 1000) / (autoPanel.capacityW ?? 1)) : 0;
    
    return { autoInverter, autoBattery, defaultAutoBatteryQty, autoPanel, defaultAutoPanelQty };
  }, [inverters, batteries, panels, requiredInverterKW, batteryConfig, pvKWp]);

  const activeInverterSku = manualInverterOverride && selectedInverterSku ? selectedInverterSku : autoInverter?.sku || '';
  const activeInverter = inverters.find(i => i.sku === activeInverterSku);
  
  const activeBatterySku = selectedBatterySku || autoBattery?.sku || '';
  const activeBattery = batteries.find(i => i.sku === activeBatterySku);
  const activeBatteryQty = selectedBatteryQty !== '' ? selectedBatteryQty : defaultAutoBatteryQty;

  const activePanelSku = selectedPanelSku || autoPanel?.sku || '';
  const activePanel = panels.find(i => i.sku === activePanelSku);
  const activePanelQty = selectedPanelQty !== '' ? selectedPanelQty : defaultAutoPanelQty;
  const totalInstalledPV = activePanel ? (activePanelQty * (activePanel.capacityW ?? 0)) / 1000 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Load Profile</CardTitle>
              <CardDescription>Enter appliances to calculate total energy demand.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[28%]">Appliance</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Watts (W)</TableHead>
                    <TableHead>Hrs/Day</TableHead>
                    <TableHead>Hrs/Night</TableHead>
                    <TableHead className="text-right">Day Wh</TableHead>
                    <TableHead className="text-right">Night Wh</TableHead>
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
                        <Input type="number" min="0" max="24" value={app.hoursDay || ''} onChange={(e) => updateAppliance(app.id, 'hoursDay', parseInt(e.target.value) || 0)} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" min="0" max="24" value={app.hoursNight || ''} onChange={(e) => updateAppliance(app.id, 'hoursNight', parseInt(e.target.value) || 0)} />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {(app.qty * app.wattage * app.hoursDay).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium text-amber-600">
                        {(app.qty * app.wattage * app.hoursNight).toLocaleString()}
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

          <Card>
            <CardHeader>
              <CardTitle>Cable Sizing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">PV Cable</h4>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Size</Label>
                    <Select value={pvCableSize} onValueChange={setPvCableSize}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4mm²">4mm²</SelectItem>
                        <SelectItem value="6mm²">6mm²</SelectItem>
                        <SelectItem value="10mm²">10mm²</SelectItem>
                        <SelectItem value="16mm²">16mm²</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Length (m)</Label>
                    <Input type="number" value={pvCableLength} onChange={e => setPvCableLength(Number(e.target.value))} />
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">AC Cable</h4>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Size</Label>
                    <Select value={acCableSize} onValueChange={setAcCableSize}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6mm²">6mm²</SelectItem>
                        <SelectItem value="10mm²">10mm²</SelectItem>
                        <SelectItem value="16mm²">16mm²</SelectItem>
                        <SelectItem value="25mm²">25mm²</SelectItem>
                        <SelectItem value="35mm²">35mm²</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Length (m)</Label>
                    <Input type="number" value={acCableLength} onChange={e => setAcCableLength(Number(e.target.value))} />
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Battery Cable</h4>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Size</Label>
                    <Select value={batCableSize} onValueChange={setBatCableSize}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25mm²">25mm²</SelectItem>
                        <SelectItem value="35mm²">35mm²</SelectItem>
                        <SelectItem value="50mm²">50mm²</SelectItem>
                        <SelectItem value="70mm²">70mm²</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Length (m)</Label>
                    <Input type="number" value={batCableLength} onChange={e => setBatCableLength(Number(e.target.value))} />
                  </div>
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
                  <Select value={linkedLeadId} onValueChange={setLinkedLeadId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a lead..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allLeads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost / Nurture').map(lead => (
                        <SelectItem key={lead.leadRef} value={lead.leadRef}>{lead.leadRef} - {lead.customerName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
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
                  <div className="text-2xl font-bold">{totalLoad.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">W</span></div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Daily Energy</div>
                  <div className="text-2xl font-bold">{totalDayEnergy.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">Wh</span></div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-dashed border-border">
                <div className="flex justify-between items-center p-3 rounded-md bg-muted/40 border">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Night Energy × 1.25</div>
                    <div className="text-2xl font-bold">{batteryConfig.moduleKWh * batteryConfig.qty} kWh</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {(totalNightEnergy / 1000).toFixed(2)} kWh night-time × 1.25 = {batteryKWh.toFixed(2)} kWh required
                    </div>
                    <div className="text-xs font-medium text-amber-600 mt-0.5">
                      → {batteryConfig.qty}× {batteryConfig.moduleKWh} kWh module{batteryConfig.qty > 1 ? 's' : ''} selected
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 rounded-md bg-muted/40 border">
                  <span className="text-sm font-medium">PV Required</span>
                  <span className="font-bold text-primary">{pvKWp.toFixed(2)} kWp</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-md bg-muted/40 border">
                  <span className="text-sm font-medium">Required Inverter Tier</span>
                  <span className="font-bold text-primary">{requiredInverterKW} kW</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Component Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-bold flex justify-between">
                  Inverter
                  {!autoInverter && !manualInverterOverride && <span className="flex items-center text-xs text-amber-600"><AlertTriangle className="h-3 w-3 mr-1"/> Manual review required</span>}
                </Label>
                <Select value={activeInverterSku} onValueChange={(val) => { setManualInverterOverride(true); setSelectedInverterSku(val); }}>
                  <SelectTrigger className="w-full h-auto py-2">
                    <SelectValue placeholder="Select inverter" />
                  </SelectTrigger>
                  <SelectContent>
                    {inverters.map(inv => (
                      <SelectItem key={inv.sku} value={inv.sku}>
                        <div className="flex flex-col text-left">
                          <span className="font-medium">{inv.model} ({inv.brand})</span>
                          <span className="text-xs text-muted-foreground">{inv.specs}</span>
                          {canSeePrices() && inv.sellingPrice != null && <span className="text-xs font-semibold mt-1">₦{inv.sellingPrice.toLocaleString()}</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold">Battery Bank</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select value={activeBatterySku} onValueChange={setSelectedBatterySku}>
                      <SelectTrigger className="h-auto py-2"><SelectValue placeholder="Select battery" /></SelectTrigger>
                      <SelectContent>
                        {batteries.map(bat => (
                          <SelectItem key={bat.sku} value={bat.sku}>
                            <div className="flex flex-col text-left">
                              <span className="font-medium">{bat.model} ({bat.brand})</span>
                              {canSeePrices() && bat.sellingPrice != null && <span className="text-xs font-semibold">₦{bat.sellingPrice.toLocaleString()}</span>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input type="number" value={activeBatteryQty} onChange={e => setSelectedBatteryQty(Number(e.target.value))} className="w-20" min={1} />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold">Solar Panels</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select value={activePanelSku} onValueChange={setSelectedPanelSku}>
                      <SelectTrigger className="h-auto py-2"><SelectValue placeholder="Select panels" /></SelectTrigger>
                      <SelectContent>
                        {panels.map(pan => (
                          <SelectItem key={pan.sku} value={pan.sku}>
                            <div className="flex flex-col text-left">
                              <span className="font-medium">{pan.model} ({pan.brand})</span>
                              {canSeePrices() && pan.sellingPrice != null && <span className="text-xs font-semibold">₦{pan.sellingPrice.toLocaleString()}</span>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input type="number" value={activePanelQty} onChange={e => setSelectedPanelQty(Number(e.target.value))} className="w-20" min={0} />
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  Total PV: <span className="font-semibold text-foreground">{totalInstalledPV.toFixed(2)} kWp</span>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-md text-xs space-y-1">
                <div className="flex justify-between"><span>PV Cable</span> <span>{pvCableSize} - {pvCableLength}m</span></div>
                <div className="flex justify-between"><span>AC Cable</span> <span>{acCableSize} - {acCableLength}m</span></div>
                <div className="flex justify-between"><span>Battery Cable</span> <span>{batCableSize} - {batCableLength}m</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}