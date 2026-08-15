// Centralised API client for BuDOM frontend
// All requests go through /api (proxied by Vite to the API server in dev)

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Auth
export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ user: SafeUser }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),
    me: () => request<{ user: SafeUser }>("/auth/me"),
  },
  applications: {
    list: () => request<{ applications: Application[] }>("/applications"),
    get: (id: number) => request<{ application: Application }>(`/applications/${id}`),
    create: (data: Record<string, string>) =>
      request<{ ok: boolean; refId: string }>("/applications", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Application>) =>
      request<{ application: Application }>(`/applications/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    updateKyc: (id: number, kycStatus: string, adminNotes?: string) =>
      request<{ application: Application }>(`/applications/${id}/kyc`, { method: "PATCH", body: JSON.stringify({ kycStatus, adminNotes }) }),
    shortlist: (id: number) =>
      request<{ application: Application }>(`/applications/${id}/shortlist`, { method: "PATCH", body: JSON.stringify({}) }),
    activate: (id: number) =>
      request<{ application: Application; credentials: { vbdoId: string; username: string; defaultPassword: string; email: string } }>(`/applications/${id}/activate`, { method: "PATCH", body: JSON.stringify({}) }),
    reject: (id: number, reason?: string) =>
      request<{ application: Application }>(`/applications/${id}/reject`, { method: "PATCH", body: JSON.stringify({ reason }) }),
    certificateUrl: (id: number) => `${BASE}/api/documents/certificate/${id}`,
    workIdUrl: (id: number) => `${BASE}/api/documents/work-id/${id}`,
  },
  broadcasts: {
    list: () => request<{ broadcasts: Broadcast[] }>("/broadcasts"),
    unreadCount: () => request<{ unread: number }>("/broadcasts/unread-count"),
    send: (data: { title: string; message: string; targetRoles: string }) =>
      request<{ ok: boolean; broadcast: Broadcast }>("/broadcasts", { method: "POST", body: JSON.stringify(data) }),
    markRead: (id: number) =>
      request<{ ok: boolean }>(`/broadcasts/${id}/read`, { method: "PATCH", body: JSON.stringify({}) }),
    markAllRead: () =>
      request<{ ok: boolean }>("/broadcasts/read-all", { method: "PATCH", body: JSON.stringify({}) }),
    delete: (id: number) =>
      request<{ ok: boolean }>(`/broadcasts/${id}`, { method: "DELETE" }),
  },
  bdos: {
    list: () => request<{ bdos: Bdo[] }>("/bdos"),
    get: (vbdoId: string) => request<{ bdo: Bdo }>(`/bdos/${vbdoId}`),
    create: (data: Partial<Bdo>) => request<{ bdo: Bdo }>("/bdos", { method: "POST", body: JSON.stringify(data) }),
    update: (vbdoId: string, data: Partial<Bdo>) =>
      request<{ bdo: Bdo }>(`/bdos/${vbdoId}`, { method: "PATCH", body: JSON.stringify(data) }),
  },
  leads: {
    list: () => request<{ leads: Lead[] }>("/leads"),
    get: (leadRef: string) => request<{ lead: Lead }>(`/leads/${leadRef}`),
    create: (data: Partial<Lead>) => request<{ lead: Lead }>("/leads", { method: "POST", body: JSON.stringify(data) }),
    update: (leadRef: string, data: Partial<Lead>) =>
      request<{ lead: Lead }>(`/leads/${leadRef}`, { method: "PATCH", body: JSON.stringify(data) }),
  },
  customers: {
    list: () => request<{ customers: Customer[] }>("/customers"),
    get: (cidRef: string) => request<{ customer: Customer }>(`/customers/${cidRef}`),
    create: (data: Partial<Customer>) => request<{ customer: Customer }>("/customers", { method: "POST", body: JSON.stringify(data) }),
    update: (cidRef: string, data: Partial<Customer>) =>
      request<{ customer: Customer }>(`/customers/${cidRef}`, { method: "PATCH", body: JSON.stringify(data) }),
  },
  designs: {
    list: () => request<{ designs: Design[] }>("/designs"),
    get: (designRef: string) => request<{ design: Design; history: DesignHistory[] }>(`/designs/${designRef}`),
    create: (data: Partial<Design>) => request<{ design: Design }>("/designs", { method: "POST", body: JSON.stringify(data) }),
    update: (designRef: string, data: Partial<Design>) =>
      request<{ design: Design }>(`/designs/${designRef}`, { method: "PATCH", body: JSON.stringify(data) }),
    lock: (designRef: string) => request<{ design: Design }>(`/designs/${designRef}/lock`, { method: "POST" }),
    unlock: (designRef: string) => request<{ design: Design }>(`/designs/${designRef}/unlock`, { method: "POST" }),
  },
  inventory: {
    list: () => request<{ inventory: InventoryItem[]; canSeePrices: boolean }>("/inventory"),
    get: (sku: string) => request<{ item: InventoryItem; audit: PriceAudit[] }>(`/inventory/${sku}`),
    create: (data: Partial<InventoryItem>) => request<{ item: InventoryItem }>("/inventory", { method: "POST", body: JSON.stringify(data) }),
    update: (sku: string, data: Partial<InventoryItem>) =>
      request<{ item: InventoryItem }>(`/inventory/${sku}`, { method: "PATCH", body: JSON.stringify(data) }),
  },
  invoices: {
    list: () => request<{ invoices: Invoice[] }>("/invoices"),
    get: (invoiceRef: string) => request<{ invoice: Invoice; payments: Payment[]; amountPaid: number; balance: number }>(`/invoices/${invoiceRef}`),
    create: (data: Partial<Invoice>) => request<{ invoice: Invoice }>("/invoices", { method: "POST", body: JSON.stringify(data) }),
    update: (invoiceRef: string, data: Partial<Invoice>) =>
      request<{ invoice: Invoice }>(`/invoices/${invoiceRef}`, { method: "PATCH", body: JSON.stringify(data) }),
    recordPayment: (invoiceRef: string, data: Record<string, unknown>) =>
      request<{ payment: Payment }>(`/invoices/${invoiceRef}/payments`, { method: "POST", body: JSON.stringify(data) }),
  },
  commissions: {
    list: () => request<{ commissions: Commission[] }>("/commissions"),
    update: (id: number, data: { status: string }) =>
      request<{ commission: Commission }>(`/commissions/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  },
  expenses: {
    list: () => request<{ expenses: Expense[] }>("/expenses"),
    create: (data: Record<string, unknown>) => request<{ expense: Expense }>("/expenses", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Record<string, unknown>) =>
      request<{ expense: Expense }>(`/expenses/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) => request<{ ok: boolean }>(`/expenses/${id}`, { method: "DELETE" }),
  },
  finance: {
    summary: () => request<FinanceSummary>("/finance/summary"),
  },
  users: {
    list: () => request<{ users: SafeUser[] }>("/users"),
  },
};

// ---- Shared types (matches DB schema) ----
export interface SafeUser {
  id: number;
  email: string;
  name: string;
  roles: string[];
  vbdoId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: number;
  refId: string;
  // Step 1
  title: string | null;
  fullName: string;
  email: string;
  phone: string;
  whatsappNumber: string | null;
  dob: string | null;
  address: string | null;
  // Step 2
  coverageAreas: string | null;
  hasOffice: string | null;
  officeAddress: string | null;
  officeCurrentUse: string | null;
  wantsVerjSticker: string | null;
  occupation: string | null;
  employerName: string | null;
  education: string | null;
  hasSalesExperience: string | null;
  previousSalesDetail: string | null;
  salesExperience: string | null;
  // Step 3
  referralSource: string | null;
  photoUrl: string | null;
  idDocumentUrl: string | null;
  statement: string | null;
  // Step 4
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  // Legacy fields (kept for existing records)
  gender: string | null;
  state: string | null;
  lga: string | null;
  nin: string | null;
  bvn: string | null;
  guarantorName: string | null;
  guarantorPhone: string | null;
  guarantorRelationship: string | null;
  guarantorAddress: string | null;
  kycStatus: string;
  assessmentStatus: string;
  assessmentScore: number | null;
  assessmentTotal: number | null;
  assessmentPassed: boolean | null;
  assessmentCompletedAt: string | null;
  shortlistedAt: string | null;
  status: string;
  adminNotes: string | null;
  assignedEngineerId: string | null;
  generatedUsername: string | null;
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Bdo {
  id: number;
  vbdoId: string;
  userId: number | null;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  status: string;
  assignedEngineerId: number | null;
  username: string | null;
  leadsCount: number;
  totalValue: number;
  commissionEarned: number;
  birthday: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: number;
  leadRef: string;
  customerId: string | null;
  customerName: string;
  sourceBdoId: string;
  assignedEngineerId: number | null;
  stage: string;
  value: number;
  notes: string | null;
  followUpDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  cidRef: string;
  name: string;
  type: string;
  location: string | null;
  email: string | null;
  phone: string | null;
  sourceBdoId: string | null;
  leadCount: number;
  projectCount: number;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface Design {
  id: number;
  designRef: string;
  leadRef: string | null;
  customerId: string | null;
  customerName: string | null;
  sourceBdoId: string | null;
  assignedEngineerId: number | null;
  lockedById: number | null;
  lockStartedAt: string | null;
  status: string;
  systemSize: string | null;
  totalLoad: number | null;
  totalNightEnergy: number | null;
  batteryKwh: number | null;
  pvKwp: number | null;
  inverterKw: number | null;
  components: unknown;
  appliances: unknown;
  pvCableSize: string | null;
  pvCableLength: number | null;
  acCableSize: string | null;
  acCableLength: number | null;
  batCableSize: string | null;
  batCableLength: number | null;
  submittedAt: string | null;
  approvedById: number | null;
  approvalDate: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DesignHistory {
  id: number;
  designRef: string;
  engineerId: number | null;
  engineerName: string | null;
  action: string;
  note: string | null;
  startedAt: string;
  endedAt: string | null;
}

export interface InventoryItem {
  id: number;
  sku: string;
  brand: string;
  model: string;
  category: string;
  specs: string | null;
  voltage: string | null;
  capacityW: number | null;
  capacityKw: number | null;
  capacityKwh: number | null;
  currentRating: number | null;
  voltageRating: number | null;
  breakerType: string | null;
  poleCount: number | null;
  sensitivityMa: number | null;
  costPrice: number | null;
  sellingPrice: number | null;
  stockQty: number;
  qtyPurchased: number;
  qtySold: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceAudit {
  id: number;
  sku: string;
  productName: string;
  field: string;
  prevValue: number;
  newValue: number;
  changedByName: string;
  changedById: number | null;
  changedAt: string;
}

export interface Invoice {
  id: number;
  invoiceRef: string;
  customerId: string;
  customerName: string;
  leadRef: string | null;
  designRef: string | null;
  sourceBdoId: string | null;
  engineerId: number | null;
  planName: string | null;
  lineItems: unknown;
  subtotal: number;
  total: number;
  status: string;
  approvedById: number | null;
  approvedByName: string | null;
  issuedAt: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  invoiceRef: string;
  customerId: string;
  amount: number;
  paymentMethod: string | null;
  reference: string | null;
  paymentDate: string;
  type: string;
  notes: string | null;
  recordedById: number | null;
  createdAt: string;
}

export interface Commission {
  id: number;
  bdoId: string;
  bdoName: string;
  invoiceRef: string;
  customerName: string | null;
  projectValue: number;
  rate: number;
  amount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string | null;
  vendor: string | null;
  notes: string | null;
  createdById: number | null;
  createdByName: string | null;
  createdAt: string;
}

export interface FinanceSummary {
  totalRevenue: number;
  totalReceivables: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  commissionsPaid: number;
  commissionsPending: number;
  invoiceCount: number;
  paidInvoiceCount: number;
  recentInvoices: Invoice[];
  recentExpenses: Expense[];
}

export interface Broadcast {
  id: number;
  title: string;
  message: string;
  targetRoles: string;
  sentByName: string | null;
  createdAt: string;
  readAt: string | null;
}
