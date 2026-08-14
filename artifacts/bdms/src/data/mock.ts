import { format, subDays, addDays } from 'date-fns';

export type Role = 'Super Admin' | 'Management' | 'Recruitment/Admin' | 'Sales Admin' | 'Technical Officer' | 'Lead Technical Officer' | 'Finance' | 'BDO';

export const mockUsers = [
  { id: 'USR-01', name: 'Oluwaseun Adebayo', role: 'Super Admin' as Role },
  { id: 'USR-02', name: 'Chinedu Eze', role: 'Finance' as Role },
  { id: 'USR-03', name: 'Fatima Bello', role: 'Sales Admin' as Role },
  { id: 'USR-04', name: 'Emeka Nwosu', role: 'Lead Technical Officer' as Role },
  { id: 'USR-05', name: 'Aisha Yekini', role: 'BDO' as Role, vbdoId: 'VBDO-0001' },
];

export const mockBdoApplications = [
  { id: 'APP-001', name: 'Nnamdi Okafor', email: 'nnamdi.o@example.com', phone: '08012345678', location: 'Lagos', status: 'Submitted', date: subDays(new Date(), 1).toISOString() },
  { id: 'APP-002', name: 'Tosin Abiola', email: 'tosin.a@example.com', phone: '08023456789', location: 'Abuja', status: 'KYC Pending', date: subDays(new Date(), 3).toISOString() },
  { id: 'APP-003', name: 'Ibrahim Musa', email: 'ibrahim.m@example.com', phone: '08034567890', location: 'Kano', status: 'Shortlisted', date: subDays(new Date(), 5).toISOString() },
  { id: 'APP-004', name: 'Grace Johnson', email: 'grace.j@example.com', phone: '08045678901', location: 'Port Harcourt', status: 'Rejected', date: subDays(new Date(), 7).toISOString() },
];

export const mockBdos = [
  { id: 'VBDO-0001', name: 'Aisha Yekini', email: 'aisha.y@verjsolar.com', phone: '08011112222', location: 'Lagos', status: 'Active', leadsCount: 12, totalValue: 45000000, commissionEarned: 1350000, joinedAt: subDays(new Date(), 120).toISOString(), birthday: addDays(new Date(), 10).toISOString() },
  { id: 'VBDO-0002', name: 'David Olatunji', email: 'david.o@verjsolar.com', phone: '08022223333', location: 'Abuja', status: 'Active', leadsCount: 8, totalValue: 28000000, commissionEarned: 840000, joinedAt: subDays(new Date(), 90).toISOString(), birthday: addDays(new Date(), 45).toISOString() },
  { id: 'VBDO-0003', name: 'Zainab Aliyu', email: 'zainab.a@verjsolar.com', phone: '08033334444', location: 'Kaduna', status: 'Pending', leadsCount: 0, totalValue: 0, commissionEarned: 0, joinedAt: subDays(new Date(), 5).toISOString(), birthday: subDays(new Date(), 10).toISOString() },
  { id: 'VBDO-0004', name: 'Emmanuel Chukwu', email: 'emmanuel.c@verjsolar.com', phone: '08044445555', location: 'Enugu', status: 'Inactive', leadsCount: 3, totalValue: 5000000, commissionEarned: 150000, joinedAt: subDays(new Date(), 200).toISOString(), birthday: addDays(new Date(), 120).toISOString() },
];

export const mockCustomers = [
  { id: 'CUST-001', name: 'TechHaven Ltd', type: 'Business', location: 'Lagos', email: 'contact@techhaven.ng', phone: '08055556666', sourceBdo: 'VBDO-0001', leadCount: 2, projectCount: 1, totalValue: 12500000 },
  { id: 'CUST-002', name: 'Dr. Samuel Ojo', type: 'Individual', location: 'Abuja', email: 'samuel.ojo@gmail.com', phone: '08066667777', sourceBdo: 'VBDO-0002', leadCount: 1, projectCount: 0, totalValue: 0 },
  { id: 'CUST-003', name: 'Greenfields Agro', type: 'Business', location: 'Kano', email: 'info@greenfields.ng', phone: '08077778888', sourceBdo: 'VBDO-0001', leadCount: 3, projectCount: 2, totalValue: 32500000 },
];

export const mockLeads = [
  { id: 'LEAD-00482', customerId: 'CUST-001', customerName: 'TechHaven Ltd', sourceBdo: 'VBDO-0001', stage: 'Won', value: 12500000, createdAt: subDays(new Date(), 45).toISOString(), updatedAt: subDays(new Date(), 2).toISOString() },
  { id: 'LEAD-00483', customerId: 'CUST-002', customerName: 'Dr. Samuel Ojo', sourceBdo: 'VBDO-0002', stage: 'System Design', value: 4200000, createdAt: subDays(new Date(), 15).toISOString(), updatedAt: subDays(new Date(), 5).toISOString() },
  { id: 'LEAD-00484', customerId: 'CUST-003', customerName: 'Greenfields Agro', sourceBdo: 'VBDO-0001', stage: 'Invoice', value: 18000000, createdAt: subDays(new Date(), 20).toISOString(), updatedAt: subDays(new Date(), 1).toISOString() },
  { id: 'LEAD-00485', customerName: 'Mercy Johnson', sourceBdo: 'VBDO-0002', stage: 'New Lead', value: 0, createdAt: subDays(new Date(), 1).toISOString(), updatedAt: subDays(new Date(), 1).toISOString() },
];

export const mockDesigns = [
  { id: 'DESIGN-00192', leadId: 'LEAD-00483', customerName: 'Dr. Samuel Ojo', assignedTo: 'USR-04', status: 'Submitted for Approval', systemSize: '5kVA', createdAt: subDays(new Date(), 4).toISOString() },
  { id: 'DESIGN-00193', leadId: 'LEAD-00484', customerName: 'Greenfields Agro', assignedTo: 'USR-04', status: 'Approved', systemSize: '15kVA', createdAt: subDays(new Date(), 10).toISOString() },
  { id: 'DESIGN-00191', leadId: 'LEAD-00482', customerName: 'TechHaven Ltd', assignedTo: 'USR-04', status: 'Approved', systemSize: '10kVA', createdAt: subDays(new Date(), 30).toISOString() },
];

export const mockInventory = [
  { sku: 'SP-550W-JM', brand: 'Jinko', model: 'Tiger Pro 550W', category: 'Solar Panel', costPrice: 120000, sellingPrice: 150000, stockQty: 240, status: 'Active' },
  { sku: 'INV-5KVA-FL', brand: 'Felicity', model: '5kVA 48V Hybrid', category: 'Inverter', costPrice: 450000, sellingPrice: 580000, stockQty: 15, status: 'Active' },
  { sku: 'BAT-5KWH-FL', brand: 'Felicity', model: '5kWh 48V Lithium', category: 'Battery', costPrice: 950000, sellingPrice: 1150000, stockQty: 32, status: 'Active' },
  { sku: 'CBL-6MM-DC', brand: 'Kabelmetal', model: '6mm DC Cable (100m)', category: 'Accessories', costPrice: 45000, sellingPrice: 60000, stockQty: 8, status: 'Active' },
];

export const mockInvoices = [
  { id: 'INV-2026-00482', customerId: 'CUST-001', customerName: 'TechHaven Ltd', sourceBdo: 'VBDO-0001', leadId: 'LEAD-00482', total: 12500000, status: 'Paid', date: subDays(new Date(), 10).toISOString(), dueDate: addDays(new Date(), 5).toISOString() },
  { id: 'INV-2026-00484', customerId: 'CUST-003', customerName: 'Greenfields Agro', sourceBdo: 'VBDO-0001', leadId: 'LEAD-00484', total: 18000000, status: 'Pending Approval', date: subDays(new Date(), 1).toISOString(), dueDate: addDays(new Date(), 14).toISOString() },
];

export const mockCommissions = [
  { id: 'COM-001', bdoId: 'VBDO-0001', bdoName: 'Aisha Yekini', customerName: 'TechHaven Ltd', leadId: 'LEAD-00482', projectValue: 12500000, amount: 375000, status: 'Paid', date: subDays(new Date(), 5).toISOString() },
  { id: 'COM-002', bdoId: 'VBDO-0001', bdoName: 'Aisha Yekini', customerName: 'Greenfields Agro', leadId: 'LEAD-00484', projectValue: 18000000, amount: 540000, status: 'Pending', date: subDays(new Date(), 1).toISOString() },
];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
};
