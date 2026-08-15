import { format, subDays, addDays, subMonths } from 'date-fns';

// Role types - updated to include new roles
export type Role = 'Chief Admin' | 'Super Admin' | 'Management' | 'Recruitment/Admin' | 'Sales Admin' | 'Technical Officer' | 'Lead Technical Officer' | 'Finance' | 'BDO' | 'Engineer' | 'Sales';

export interface UserRecord {
  id: string;
  name: string;
  roles: Role[]; // dual-role support
  role: Role;    // primary role for display
  vbdoId?: string;
  email?: string;
}

export const mockUsers: UserRecord[] = [
  { id: 'USR-01', name: 'Oluwaseun Adebayo', roles: ['Chief Admin'], role: 'Chief Admin', email: 'seun@verjsolar.com' },
  { id: 'USR-02', name: 'Chinedu Eze', roles: ['Finance', 'Management'], role: 'Finance', email: 'chinedu@verjsolar.com' },
  { id: 'USR-03', name: 'Fatima Bello', roles: ['Sales'], role: 'Sales', email: 'fatima@verjsolar.com' },
  { id: 'USR-04', name: 'Emeka Nwosu', roles: ['Engineer', 'Lead Technical Officer'], role: 'Lead Technical Officer', email: 'emeka@verjsolar.com' },
  { id: 'USR-05', name: 'Aisha Yekini', roles: ['BDO'], role: 'BDO', vbdoId: 'VBDO-0001', email: 'aisha@verjsolar.com' },
  { id: 'USR-06', name: 'Tunde Adewale', roles: ['Engineer'], role: 'Engineer', email: 'tunde@verjsolar.com' },
  { id: 'USR-07', name: 'Ngozi Okonkwo', roles: ['Recruitment/Admin'], role: 'Recruitment/Admin', email: 'ngozi@verjsolar.com' },
];

export const mockBdoApplications = [
  { id: 'APP-001', name: 'Nnamdi Okafor', email: 'nnamdi.o@example.com', phone: '08012345678', location: 'Lagos', status: 'Submitted', date: subDays(new Date(), 1).toISOString() },
  { id: 'APP-002', name: 'Tosin Abiola', email: 'tosin.a@example.com', phone: '08023456789', location: 'Abuja', status: 'KYC Pending', date: subDays(new Date(), 3).toISOString() },
  { id: 'APP-003', name: 'Ibrahim Musa', email: 'ibrahim.m@example.com', phone: '08034567890', location: 'Kano', status: 'Shortlisted', date: subDays(new Date(), 5).toISOString() },
  { id: 'APP-004', name: 'Grace Johnson', email: 'grace.j@example.com', phone: '08045678901', location: 'Port Harcourt', status: 'Rejected', date: subDays(new Date(), 7).toISOString() },
  { id: 'APP-005', name: 'Yemi Adesanya', email: 'yemi.a@example.com', phone: '08056789012', location: 'Ibadan', status: 'KYC Resubmission', date: subDays(new Date(), 2).toISOString() },
  { id: 'APP-006', name: 'Amina Suleiman', email: 'amina.s@example.com', phone: '08067890123', location: 'Kaduna', status: 'Submitted', date: subDays(new Date(), 0).toISOString() },
];

export const mockBdos = [
  { id: 'VBDO-0001', name: 'Aisha Yekini', email: 'aisha.y@verjsolar.com', phone: '08011112222', location: 'Lagos', status: 'Active', leadsCount: 12, totalValue: 45000000, commissionEarned: 1350000, joinedAt: subDays(new Date(), 120).toISOString(), birthday: addDays(new Date(), 10).toISOString(), assignedEngineer: 'USR-04', username: 'vbdo.aisha.0001' },
  { id: 'VBDO-0002', name: 'David Olatunji', email: 'david.o@verjsolar.com', phone: '08022223333', location: 'Abuja', status: 'Active', leadsCount: 8, totalValue: 28000000, commissionEarned: 840000, joinedAt: subDays(new Date(), 90).toISOString(), birthday: addDays(new Date(), 45).toISOString(), assignedEngineer: 'USR-06', username: 'vbdo.david.0002' },
  { id: 'VBDO-0003', name: 'Zainab Aliyu', email: 'zainab.a@verjsolar.com', phone: '08033334444', location: 'Kaduna', status: 'Pending', leadsCount: 0, totalValue: 0, commissionEarned: 0, joinedAt: subDays(new Date(), 5).toISOString(), birthday: subDays(new Date(), 10).toISOString(), assignedEngineer: 'USR-04', username: '' },
  { id: 'VBDO-0004', name: 'Emmanuel Chukwu', email: 'emmanuel.c@verjsolar.com', phone: '08044445555', location: 'Enugu', status: 'Inactive', leadsCount: 3, totalValue: 5000000, commissionEarned: 150000, joinedAt: subDays(new Date(), 200).toISOString(), birthday: addDays(new Date(), 120).toISOString(), assignedEngineer: 'USR-06', username: 'vbdo.emm.0004' },
];

export const mockCustomers = [
  { id: 'CID-000001', name: 'TechHaven Ltd', type: 'Business', location: 'Lagos', email: 'contact@techhaven.ng', phone: '08055556666', sourceBdo: 'VBDO-0001', leadCount: 2, projectCount: 1, totalValue: 12500000 },
  { id: 'CID-000002', name: 'Dr. Samuel Ojo', type: 'Individual', location: 'Abuja', email: 'samuel.ojo@gmail.com', phone: '08066667777', sourceBdo: 'VBDO-0002', leadCount: 1, projectCount: 0, totalValue: 0 },
  { id: 'CID-000003', name: 'Greenfields Agro', type: 'Business', location: 'Kano', email: 'info@greenfields.ng', phone: '08077778888', sourceBdo: 'VBDO-0001', leadCount: 3, projectCount: 2, totalValue: 32500000 },
  { id: 'CID-000004', name: 'Mercy Johnson', type: 'Individual', location: 'Port Harcourt', email: 'mercy.j@gmail.com', phone: '08088889999', sourceBdo: 'VBDO-0002', leadCount: 1, projectCount: 0, totalValue: 0 },
];

export const mockLeads = [
  { id: 'LEAD-00482', customerId: 'CID-000001', customerName: 'TechHaven Ltd', sourceBdo: 'VBDO-0001', stage: 'Won', value: 12500000, createdAt: subDays(new Date(), 45).toISOString(), updatedAt: subDays(new Date(), 2).toISOString() },
  { id: 'LEAD-00483', customerId: 'CID-000002', customerName: 'Dr. Samuel Ojo', sourceBdo: 'VBDO-0002', stage: 'System Design', value: 4200000, createdAt: subDays(new Date(), 15).toISOString(), updatedAt: subDays(new Date(), 5).toISOString() },
  { id: 'LEAD-00484', customerId: 'CID-000003', customerName: 'Greenfields Agro', sourceBdo: 'VBDO-0001', stage: 'Invoice', value: 18000000, createdAt: subDays(new Date(), 20).toISOString(), updatedAt: subDays(new Date(), 1).toISOString() },
  { id: 'LEAD-00485', customerName: 'Mercy Johnson', sourceBdo: 'VBDO-0002', stage: 'New Lead', value: 0, createdAt: subDays(new Date(), 1).toISOString(), updatedAt: subDays(new Date(), 1).toISOString() },
  { id: 'LEAD-00486', customerName: 'Alhaji Musa Garba', sourceBdo: 'VBDO-0001', stage: 'Needs Discovery', value: 0, createdAt: subDays(new Date(), 3).toISOString(), updatedAt: subDays(new Date(), 3).toISOString() },
];

// Inventory — expanded with inverter sizes for the auto-design logic, cables etc.
export const mockInventory = [
  // Solar Panels
  { sku: 'SP-550W-JM', brand: 'Jinko', model: 'Tiger Pro 550W', category: 'Solar Panel', capacityW: 550, costPrice: 120000, sellingPrice: 150000, stockQty: 240, status: 'Active', specs: '550W Mono PERC, 21.5% efficiency, 40.3Voc' },
  { sku: 'SP-580W-LS', brand: 'LONGi', model: 'Hi-MO 6 580W', category: 'Solar Panel', capacityW: 580, costPrice: 135000, sellingPrice: 165000, stockQty: 180, status: 'Active', specs: '580W Mono HPBC, 22.1% efficiency' },
  { sku: 'SP-400W-CA', brand: 'Canadian Solar', model: 'HiKu 400W', category: 'Solar Panel', capacityW: 400, costPrice: 88000, sellingPrice: 110000, stockQty: 60, status: 'Active', specs: '400W Poly, standard residential' },
  // Inverters (matching VERJ sizing tiers: 4kW, 6kW, 12kW, 24kW, 48kW, 96kW)
  { sku: 'INV-4KVA-FL', brand: 'Felicity', model: '4kW 48V Hybrid', category: 'Inverter', capacityKW: 4, costPrice: 380000, sellingPrice: 490000, stockQty: 20, status: 'Active', specs: '4kW/48V MPPT Hybrid, 80A charge' },
  { sku: 'INV-5KVA-FL', brand: 'Felicity', model: '5kVA 48V Hybrid', category: 'Inverter', capacityKW: 5, costPrice: 450000, sellingPrice: 580000, stockQty: 15, status: 'Active', specs: '5kVA/48V MPPT Hybrid, 100A charge' },
  { sku: 'INV-6KVA-SO', brand: 'Solarmax', model: '6kW 48V Hybrid', category: 'Inverter', capacityKW: 6, costPrice: 510000, sellingPrice: 660000, stockQty: 12, status: 'Active', specs: '6kW/48V MPPT, 120A charge controller' },
  { sku: 'INV-10KVA-VM', brand: 'Victron', model: 'Multiplus 10kVA', category: 'Inverter', capacityKW: 10, costPrice: 980000, sellingPrice: 1250000, stockQty: 6, status: 'Active', specs: '10kVA/48V, 200A charge' },
  { sku: 'INV-12KVA-VM', brand: 'Victron', model: 'Quattro 12kVA', category: 'Inverter', capacityKW: 12, costPrice: 1150000, sellingPrice: 1450000, stockQty: 8, status: 'Active', specs: '12kVA/48V Quattro dual-AC' },
  { sku: 'INV-24KVA-DE', brand: 'Deye', model: '24kW Three-Phase', category: 'Inverter', capacityKW: 24, costPrice: 2200000, sellingPrice: 2800000, stockQty: 4, status: 'Active', specs: '24kW 3-phase hybrid MPPT' },
  { sku: 'INV-48KVA-DE', brand: 'Deye', model: '48kW Three-Phase', category: 'Inverter', capacityKW: 48, costPrice: 4100000, sellingPrice: 5200000, stockQty: 2, status: 'Active', specs: '48kW 3-phase hybrid MPPT' },
  { sku: 'INV-96KVA-IM', brand: 'Imeon', model: '96kW Industrial', category: 'Inverter', capacityKW: 96, costPrice: 7800000, sellingPrice: 9800000, stockQty: 1, status: 'Active', specs: '96kW industrial-grade hybrid' },
  // Batteries
  { sku: 'BAT-5KWH-FL', brand: 'Felicity', model: '5kWh 48V Lithium', category: 'Battery', capacityKWh: 5, costPrice: 950000, sellingPrice: 1150000, stockQty: 32, status: 'Active', specs: '5kWh LiFePO4, BMS included, 6000 cycles' },
  { sku: 'BAT-10KWH-PI', brand: 'Pylon', model: 'US5000 (10kWh)', category: 'Battery', capacityKWh: 10, costPrice: 1800000, sellingPrice: 2200000, stockQty: 18, status: 'Active', specs: '10kWh stackable LiFePO4' },
  { sku: 'BAT-15KWH-BL', brand: 'BYD', model: 'Battery-Box 15kWh', category: 'Battery', capacityKWh: 15, costPrice: 2650000, sellingPrice: 3250000, stockQty: 10, status: 'Active', specs: '15kWh LFP, wall-mount' },
  // Cables
  { sku: 'CBL-4MM-PV', brand: 'Helukabel', model: '4mm PV Cable (100m)', category: 'PV Cable', costPrice: 32000, sellingPrice: 42000, stockQty: 25, status: 'Active', specs: '4mm² twin-core PV1-F, UV resistant' },
  { sku: 'CBL-6MM-PV', brand: 'Helukabel', model: '6mm PV Cable (100m)', category: 'PV Cable', costPrice: 45000, sellingPrice: 60000, stockQty: 18, status: 'Active', specs: '6mm² twin-core PV1-F, UV resistant' },
  { sku: 'CBL-16MM-AC', brand: 'Kabelmetal', model: '16mm AC Cable (100m)', category: 'AC Cable', costPrice: 65000, sellingPrice: 85000, stockQty: 12, status: 'Active', specs: '16mm² 3-core armoured AC cable' },
  { sku: 'CBL-25MM-AC', brand: 'Kabelmetal', model: '25mm AC Cable (100m)', category: 'AC Cable', costPrice: 95000, sellingPrice: 125000, stockQty: 8, status: 'Active', specs: '25mm² 3-core armoured AC cable' },
  { sku: 'CBL-50MM-BAT', brand: 'Cabex', model: '50mm Battery Cable (5m)', category: 'Battery Cable', costPrice: 18000, sellingPrice: 24000, stockQty: 40, status: 'Active', specs: '50mm² fine-strand battery cable, lugged ends' },
  { sku: 'CBL-70MM-BAT', brand: 'Cabex', model: '70mm Battery Cable (5m)', category: 'Battery Cable', costPrice: 24000, sellingPrice: 32000, stockQty: 30, status: 'Active', specs: '70mm² fine-strand battery cable, lugged ends' },
  // Accessories
  { sku: 'ACC-SPD-DC', brand: 'ABB', model: 'DC SPD 1000V', category: 'Accessory', costPrice: 28000, sellingPrice: 38000, stockQty: 35, status: 'Active', specs: 'DC surge protection device, 1000V, Type 2' },
  { sku: 'ACC-MCB-63A', brand: 'Schneider', model: '63A MCB', category: 'Accessory', costPrice: 8500, sellingPrice: 12000, stockQty: 80, status: 'Active', specs: '63A 2-pole MCB, C-curve' },
  { sku: 'MNT-ALUM', brand: 'Altus', model: 'Aluminum Mounting Rail (4m)', category: 'Mounting', costPrice: 12000, sellingPrice: 16000, stockQty: 150, status: 'Active', specs: '40x40mm extruded aluminium rail' },
];

// Design requests / engineering queue
export interface DesignRequest {
  id: string;
  leadId: string;
  customerId: string;
  customerName: string;
  sourceBdo: string;
  assignedEngineer: string | null;
  lockedBy: string | null;
  lockStartedAt: string | null;
  status: 'Pending' | 'In Progress' | 'Draft' | 'Submitted for Approval' | 'Approved' | 'Revision Required';
  systemSize: string;
  createdAt: string;
  submittedAt?: string;
  approvedBy?: string;
  approvalDate?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  totalLoad?: number;       // Watts
  totalEnergy?: number;     // Wh
  backupHours?: number;
  batteryKWh?: number;
  pvKWp?: number;
  inverterKW?: number;
  engineeringHistory?: Array<{ engineer: string; startedAt: string; endedAt?: string; action: string }>;
}

export const mockDesigns: DesignRequest[] = [
  { id: 'DESIGN-00192', leadId: 'LEAD-00483', customerId: 'CID-000002', customerName: 'Dr. Samuel Ojo', sourceBdo: 'VBDO-0002', assignedEngineer: 'USR-04', lockedBy: 'USR-04', lockStartedAt: new Date().toISOString(), status: 'In Progress', systemSize: '6kW', createdAt: subDays(new Date(), 4).toISOString(), totalLoad: 3200, totalEnergy: 19200, backupHours: 6, batteryKWh: 24, pvKWp: 9.7, inverterKW: 6, lastModifiedBy: 'USR-04', lastModifiedAt: new Date().toISOString(), engineeringHistory: [{ engineer: 'Emeka Nwosu', startedAt: new Date().toISOString(), action: 'Took ownership' }] },
  { id: 'DESIGN-00193', leadId: 'LEAD-00484', customerId: 'CID-000003', customerName: 'Greenfields Agro', sourceBdo: 'VBDO-0001', assignedEngineer: 'USR-06', lockedBy: null, lockStartedAt: null, status: 'Approved', systemSize: '24kW', createdAt: subDays(new Date(), 10).toISOString(), approvedBy: 'USR-04', approvalDate: subDays(new Date(), 2).toISOString(), totalLoad: 14000, totalEnergy: 98000, backupHours: 8, batteryKWh: 140, pvKWp: 42.3, inverterKW: 24 },
  { id: 'DESIGN-00191', leadId: 'LEAD-00482', customerId: 'CID-000001', customerName: 'TechHaven Ltd', sourceBdo: 'VBDO-0001', assignedEngineer: 'USR-04', lockedBy: null, lockStartedAt: null, status: 'Approved', systemSize: '12kW', createdAt: subDays(new Date(), 30).toISOString(), approvedBy: 'USR-04', approvalDate: subDays(new Date(), 20).toISOString(), totalLoad: 5500, totalEnergy: 38500, backupHours: 6, batteryKWh: 48.1, pvKWp: 18.0, inverterKW: 12 },
  { id: 'DESIGN-00194', leadId: 'LEAD-00486', customerId: 'CID-000004', customerName: 'Alhaji Musa Garba', sourceBdo: 'VBDO-0001', assignedEngineer: null, lockedBy: null, lockStartedAt: null, status: 'Pending', systemSize: 'TBD', createdAt: subDays(new Date(), 1).toISOString(), totalLoad: 0, totalEnergy: 0, backupHours: 0 },
];

export const mockInvoices = [
  { id: 'INV-2026-00482', customerId: 'CID-000001', customerName: 'TechHaven Ltd', sourceBdo: 'VBDO-0001', leadId: 'LEAD-00482', designId: 'DESIGN-00191', total: 12500000, status: 'Paid', date: subDays(new Date(), 10).toISOString(), dueDate: addDays(new Date(), 5).toISOString(), planName: 'VERJ 12kW Premium Solar Plan', approvedBy: 'USR-03', issuedAt: subDays(new Date(), 8).toISOString() },
  { id: 'INV-2026-00484', customerId: 'CID-000003', customerName: 'Greenfields Agro', sourceBdo: 'VBDO-0001', leadId: 'LEAD-00484', designId: 'DESIGN-00193', total: 18000000, status: 'Pending Approval', date: subDays(new Date(), 1).toISOString(), dueDate: addDays(new Date(), 14).toISOString(), planName: 'VERJ 24kW Industrial Solar Plan', approvedBy: null, issuedAt: null },
];

export const mockCommissions = [
  { id: 'COM-001', bdoId: 'VBDO-0001', bdoName: 'Aisha Yekini', customerName: 'TechHaven Ltd', leadId: 'LEAD-00482', projectValue: 12500000, amount: 375000, status: 'Paid', date: subDays(new Date(), 5).toISOString() },
  { id: 'COM-002', bdoId: 'VBDO-0001', bdoName: 'Aisha Yekini', customerName: 'Greenfields Agro', leadId: 'LEAD-00484', projectValue: 18000000, amount: 540000, status: 'Pending', date: subDays(new Date(), 1).toISOString() },
];

// Manual expenses
export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  vendor: string;
  notes: string;
  createdBy: string;
}

export const mockExpenses: Expense[] = [
  { id: 'EXP-001', date: subDays(new Date(), 5).toISOString(), category: 'Operations', description: 'Office supplies and stationery', amount: 85000, paymentMethod: 'Bank Transfer', vendor: 'Shoprite Nigeria', notes: '', createdBy: 'USR-02' },
  { id: 'EXP-002', date: subDays(new Date(), 10).toISOString(), category: 'Logistics', description: 'Equipment delivery — Lagos to Abuja', amount: 350000, paymentMethod: 'Cash', vendor: 'ABC Logistics Ltd', notes: 'For LEAD-00482 installation', createdBy: 'USR-02' },
  { id: 'EXP-003', date: subDays(new Date(), 15).toISOString(), category: 'Marketing', description: 'Social media advertising — Q2', amount: 500000, paymentMethod: 'Bank Transfer', vendor: 'Meta Ads', notes: '', createdBy: 'USR-01' },
  { id: 'EXP-004', date: subMonths(new Date(), 1).toISOString(), category: 'Payroll', description: 'Staff salaries — July 2026', amount: 4200000, paymentMethod: 'Bank Transfer', vendor: 'Internal', notes: '', createdBy: 'USR-02' },
];

// Price audit log
export interface PriceAuditEntry {
  id: string;
  sku: string;
  productName: string;
  field: 'costPrice' | 'sellingPrice';
  prevValue: number;
  newValue: number;
  changedBy: string;
  changedAt: string;
}

export const mockPriceAudit: PriceAuditEntry[] = [
  { id: 'PA-001', sku: 'SP-550W-JM', productName: 'Jinko Tiger Pro 550W', field: 'sellingPrice', prevValue: 140000, newValue: 150000, changedBy: 'Fatima Bello', changedAt: subDays(new Date(), 7).toISOString() },
  { id: 'PA-002', sku: 'BAT-5KWH-FL', productName: 'Felicity 5kWh Lithium', field: 'costPrice', prevValue: 920000, newValue: 950000, changedBy: 'Oluwaseun Adebayo', changedAt: subDays(new Date(), 14).toISOString() },
];

// Finance data with 12 months
export const mockFinanceMonths = Array.from({ length: 12 }, (_, i) => {
  const d = subMonths(new Date(), 11 - i);
  const rev = 40000000 + i * 3000000 + Math.floor(Math.random() * 5000000);
  const cogs = rev * 0.65;
  const opex = 5000000 + i * 100000;
  return { month: format(d, 'MMM'), revenue: rev, cogs, opex, grossProfit: rev - cogs, netProfit: rev - cogs - opex };
});

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
};
