import { Router } from "express";
import { db } from "../lib/db.js";
import { bdosTable, customersTable, leadsTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { REFERENCE_ALLOCATION_LOCK_ID } from "../lib/reference-locks.js";
import { canViewCustomerContacts, customerNameForViewer } from "../lib/customer-access.js";

const router = Router();
const LEAD_CREATOR_ROLES = ["Chief Admin", "Super Admin", "Management", "Sales Admin"];
const LEAD_MANAGER_ROLES = [...LEAD_CREATOR_ROLES, "Sales", "Lead Technical Officer"];
const LEAD_STAGES = [
  "New Lead",
  "Contacted",
  "Needs Discovery",
  "Load Details Submitted",
  "Technical Assessment",
  "System Design",
  "Design Approval",
  "Invoice",
  "Follow-Up / Negotiation",
  "Won",
  "Lost / Nurture",
];

interface CreateLeadData {
  customerName: string;
  customerType: "Individual" | "Business";
  customerPhone?: string;
  customerEmail?: string;
  customerLocation?: string;
  sourceBdoId?: string;
  value: number;
  notes?: string;
  followUpDate?: string;
}

type CreateLeadParseResult =
  | { success: true; data: CreateLeadData }
  | { success: false; error: string };

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function parseCreateLead(body: unknown): CreateLeadParseResult {
  if (!body || typeof body !== "object") {
    return { success: false, error: "Invalid lead details" };
  }

  const input = body as Record<string, unknown>;
  const customerName = optionalString(input.customerName);
  if (!customerName || customerName.length < 2) {
    return { success: false, error: "Customer name must contain at least 2 characters" };
  }
  if (customerName.length > 160) {
    return { success: false, error: "Customer name is too long" };
  }

  const customerType = input.customerType ?? "Individual";
  if (customerType !== "Individual" && customerType !== "Business") {
    return { success: false, error: "Select a valid customer type" };
  }

  const customerPhone = optionalString(input.customerPhone);
  const customerEmail = optionalString(input.customerEmail);
  const customerLocation = optionalString(input.customerLocation);
  const sourceBdoId = optionalString(input.sourceBdoId);
  const notes = optionalString(input.notes);
  const followUpDate = optionalString(input.followUpDate);

  if (customerPhone && customerPhone.length > 40) {
    return { success: false, error: "Customer phone number is too long" };
  }
  if (customerEmail && (customerEmail.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))) {
    return { success: false, error: "Enter a valid customer email" };
  }
  if (customerLocation && customerLocation.length > 240) {
    return { success: false, error: "Customer location is too long" };
  }
  if (sourceBdoId && sourceBdoId.length > 32) {
    return { success: false, error: "Select a valid BDO" };
  }
  if (notes && notes.length > 2_000) {
    return { success: false, error: "Opportunity notes are too long" };
  }
  if (followUpDate && Number.isNaN(new Date(followUpDate).getTime())) {
    return { success: false, error: "Select a valid follow-up date" };
  }

  const rawValue = input.value ?? 0;
  const value = typeof rawValue === "number" ? rawValue : Number(rawValue);
  if (!Number.isInteger(value) || value < 0 || value > 2_000_000_000) {
    return { success: false, error: "Estimated project value must be a valid whole amount" };
  }

  return {
    success: true,
    data: {
      customerName,
      customerType,
      customerPhone,
      customerEmail,
      customerLocation,
      sourceBdoId,
      value,
      notes,
      followUpDate,
    },
  };
}

type UpdateLeadData = {
  stage?: string;
  value?: number;
  notes?: string | null;
  followUpDate?: Date | null;
  assignedEngineerId?: number | null;
};

type UpdateLeadParseResult =
  | { success: true; data: UpdateLeadData }
  | { success: false; error: string };

function parseUpdateLead(body: unknown): UpdateLeadParseResult {
  if (!body || typeof body !== "object") {
    return { success: false, error: "Invalid lead update" };
  }

  const input = body as Record<string, unknown>;
  for (const immutableField of ["leadRef", "sourceBdoId", "customerId", "customerName"]) {
    if (Object.prototype.hasOwnProperty.call(input, immutableField)) {
      return { success: false, error: `${immutableField} cannot be changed through this endpoint` };
    }
  }

  const data: UpdateLeadData = {};
  if (Object.prototype.hasOwnProperty.call(input, "stage")) {
    if (typeof input.stage !== "string" || !LEAD_STAGES.includes(input.stage)) {
      return { success: false, error: "Select a valid lead stage" };
    }
    data.stage = input.stage;
  }

  if (Object.prototype.hasOwnProperty.call(input, "value")) {
    const value = typeof input.value === "number" ? input.value : Number(input.value);
    if (!Number.isInteger(value) || value < 0 || value > 2_000_000_000) {
      return { success: false, error: "Project value must be a valid whole amount" };
    }
    data.value = value;
  }

  if (Object.prototype.hasOwnProperty.call(input, "notes")) {
    if (input.notes === null || input.notes === "") {
      data.notes = null;
    } else if (typeof input.notes === "string" && input.notes.trim().length <= 2_000) {
      data.notes = input.notes.trim();
    } else {
      return { success: false, error: "Opportunity notes are too long" };
    }
  }

  if (Object.prototype.hasOwnProperty.call(input, "followUpDate")) {
    if (input.followUpDate === null || input.followUpDate === "") {
      data.followUpDate = null;
    } else if (typeof input.followUpDate === "string" && !Number.isNaN(new Date(input.followUpDate).getTime())) {
      data.followUpDate = new Date(input.followUpDate);
    } else {
      return { success: false, error: "Select a valid follow-up date" };
    }
  }

  if (Object.prototype.hasOwnProperty.call(input, "assignedEngineerId")) {
    if (input.assignedEngineerId === null) {
      data.assignedEngineerId = null;
    } else {
      const assignedEngineerId = typeof input.assignedEngineerId === "number"
        ? input.assignedEngineerId
        : Number(input.assignedEngineerId);
      if (!Number.isInteger(assignedEngineerId) || assignedEngineerId <= 0) {
        return { success: false, error: "Select a valid engineer" };
      }
      data.assignedEngineerId = assignedEngineerId;
    }
  }

  if (Object.keys(data).length === 0) {
    return { success: false, error: "No supported lead fields were provided" };
  }
  return { success: true, data };
}

function visibleLeadForUser<T extends typeof leadsTable.$inferSelect>(user: NonNullable<Express.Request["session"]["user"]>, lead: T) {
  if (canViewCustomerContacts(user, lead)) return lead;
  return {
    ...lead,
    customerName: customerNameForViewer(user, lead),
    notes: null,
  };
}

router.get("/leads", requireAuth, async (req, res) => {
  const user = req.session.user!;
  const isBdo = user.roles.includes("BDO");
  const leads = isBdo && user.vbdoId
    ? await db.select().from(leadsTable).where(eq(leadsTable.sourceBdoId, user.vbdoId)).orderBy(desc(leadsTable.createdAt))
    : await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));
  res.json({ leads: leads.map(lead => visibleLeadForUser(user, lead)) });
});

router.get("/leads/:leadRef", requireAuth, async (req, res) => {
  const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.leadRef, req.params.leadRef)).limit(1);
  if (!lead) { res.status(404).json({ error: "Not found" }); return; }
  const user = req.session.user!;
  if (user.roles.includes("BDO") && lead.sourceBdoId !== user.vbdoId) {
    res.status(404).json({ error: "Not found" }); return;
  }
  res.json({ lead: visibleLeadForUser(user, lead) });
});

router.post("/leads", requireAuth, async (req, res) => {
  const parsed = parseCreateLead(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const user = req.session.user!;
  const isBdo = user.roles.includes("BDO");
  const canAssignBdo = user.roles.some(role => LEAD_CREATOR_ROLES.includes(role));
  if (!isBdo && !canAssignBdo) {
    res.status(403).json({ error: "Your role cannot create leads" });
    return;
  }

  const sourceBdoId = isBdo ? user.vbdoId : parsed.data.sourceBdoId;
  if (!sourceBdoId) {
    res.status(400).json({ error: isBdo ? "Your account is missing a VBDO ID" : "Select a BDO for this lead" });
    return;
  }

  const [sourceBdo] = await db.select({
    vbdoId: bdosTable.vbdoId,
    status: bdosTable.status,
  }).from(bdosTable).where(eq(bdosTable.vbdoId, sourceBdoId)).limit(1);
  if (!sourceBdo || sourceBdo.status !== "Active") {
    res.status(400).json({ error: "The selected BDO is not active" });
    return;
  }

  const lead = await db.transaction(async tx => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${REFERENCE_ALLOCATION_LOCK_ID})`);

    const [latestLead] = await tx.select({ leadRef: leadsTable.leadRef }).from(leadsTable).orderBy(desc(leadsTable.id)).limit(1);
    const lastLeadNumber = latestLead ? Number.parseInt(latestLead.leadRef.replace("LEAD-", ""), 10) : 480;
    const leadRef = `LEAD-${String(lastLeadNumber + 1).padStart(5, "0")}`;

    const [latestCustomer] = await tx.select({ cidRef: customersTable.cidRef }).from(customersTable).orderBy(desc(customersTable.id)).limit(1);
    const lastCustomerNumber = latestCustomer ? Number.parseInt(latestCustomer.cidRef.replace("CID-", ""), 10) : 0;
    const cidRef = `CID-${String(lastCustomerNumber + 1).padStart(6, "0")}`;

    const [customer] = await tx.insert(customersTable).values({
      cidRef,
      name: parsed.data.customerName,
      type: parsed.data.customerType,
      location: parsed.data.customerLocation || null,
      email: parsed.data.customerEmail || null,
      phone: parsed.data.customerPhone || null,
      sourceBdoId,
      leadCount: 1,
      totalValue: parsed.data.value,
    }).returning();

    const [createdLead] = await tx.insert(leadsTable).values({
      leadRef,
      customerId: customer.cidRef,
      customerName: parsed.data.customerName,
      sourceBdoId,
      stage: "New Lead",
      value: parsed.data.value,
      notes: parsed.data.notes || null,
      followUpDate: parsed.data.followUpDate ? new Date(parsed.data.followUpDate) : null,
    }).returning();

    await tx.update(bdosTable).set({
      leadsCount: sql`${bdosTable.leadsCount} + 1`,
      totalValue: sql`${bdosTable.totalValue} + ${parsed.data.value}`,
      updatedAt: new Date(),
    }).where(eq(bdosTable.vbdoId, sourceBdoId));

    return createdLead;
  });

  res.status(201).json({ lead: visibleLeadForUser(user, lead) });
});

router.patch("/leads/:leadRef", requireAuth, async (req, res) => {
  const parsed = parseUpdateLead(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const [existing] = await db.select().from(leadsTable).where(eq(leadsTable.leadRef, req.params.leadRef)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const user = req.session.user!;
  const isBdo = user.roles.includes("BDO");
  const canManageLeads = user.roles.some(role => LEAD_MANAGER_ROLES.includes(role));
  if (isBdo && existing.sourceBdoId !== user.vbdoId) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (!isBdo && !canManageLeads) {
    res.status(403).json({ error: "Your role cannot update leads" });
    return;
  }
  if (isBdo && Object.prototype.hasOwnProperty.call(parsed.data, "assignedEngineerId")) {
    res.status(403).json({ error: "BDOs cannot assign engineers" });
    return;
  }

  const updated = await db.transaction(async tx => {
    const [lockedLead] = await tx.select()
      .from(leadsTable)
      .where(eq(leadsTable.id, existing.id))
      .limit(1)
      .for("update");
    if (!lockedLead) {
      throw new Error("Lead disappeared while it was being updated");
    }

    const [changedLead] = await tx.update(leadsTable).set({
      ...parsed.data,
      updatedAt: new Date(),
    }).where(eq(leadsTable.id, lockedLead.id)).returning();

    if (parsed.data.value !== undefined && parsed.data.value !== lockedLead.value) {
      const difference = parsed.data.value - lockedLead.value;
      await tx.update(bdosTable).set({
        totalValue: sql`GREATEST(0, ${bdosTable.totalValue} + ${difference})`,
        updatedAt: new Date(),
      }).where(eq(bdosTable.vbdoId, lockedLead.sourceBdoId));

      if (lockedLead.customerId) {
        await tx.update(customersTable).set({
          totalValue: sql`GREATEST(0, ${customersTable.totalValue} + ${difference})`,
          updatedAt: new Date(),
        }).where(eq(customersTable.cidRef, lockedLead.customerId));
      }
    }

    return changedLead;
  });

  res.json({ lead: visibleLeadForUser(user, updated) });
});

export default router;
