import { Router } from "express";
import { db } from "../lib/db.js";
import { invoicesTable, paymentsTable, commissionsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireRoles } from "../middleware/auth.js";

const router = Router();

router.get("/invoices", requireAuth, async (_req, res) => {
  const invoices = await db.select().from(invoicesTable).orderBy(desc(invoicesTable.createdAt));
  res.json({ invoices });
});

router.get("/invoices/:invoiceRef", requireAuth, async (req, res) => {
  const [invoice] = await db.select().from(invoicesTable).where(eq(invoicesTable.invoiceRef, req.params.invoiceRef)).limit(1);
  if (!invoice) { res.status(404).json({ error: "Not found" }); return; }
  const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.invoiceRef, req.params.invoiceRef)).orderBy(desc(paymentsTable.createdAt));
  const amountPaid = payments.reduce((s, p) => s + p.amount, 0);
  res.json({ invoice, payments, amountPaid, balance: invoice.total - amountPaid });
});

router.post("/invoices", requireAuth, requireRoles("Chief Admin", "Super Admin", "Sales", "Sales Admin", "Lead Technical Officer"), async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const existing = await db.select({ invoiceRef: invoicesTable.invoiceRef }).from(invoicesTable).orderBy(desc(invoicesTable.id)).limit(1);
  const lastNum = existing[0] ? parseInt(existing[0].invoiceRef.split("-")[2] ?? "480", 10) : 480;
  const year = new Date().getFullYear();
  const invoiceRef = `INV-${year}-${String(lastNum + 1).padStart(5, "0")}`;
  const [invoice] = await db.insert(invoicesTable).values({ ...body as never, invoiceRef }).returning();
  res.status(201).json({ invoice });
});

router.patch("/invoices/:invoiceRef", requireAuth, async (req, res) => {
  const user = req.session.user!;
  const body = req.body as Partial<typeof invoicesTable.$inferInsert>;

  // Approval flow
  if (body.status === "Approved") {
    const canApprove = user.roles.some(r => ["Chief Admin", "Super Admin", "Sales", "Sales Admin"].includes(r));
    if (!canApprove) { res.status(403).json({ error: "Not authorised to approve invoices" }); return; }
    body.approvedById = user.id;
    body.approvedByName = user.name;
    body.issuedAt = new Date();
  }

  const [updated] = await db.update(invoicesTable).set({ ...body, updatedAt: new Date() }).where(eq(invoicesTable.invoiceRef, req.params.invoiceRef)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }

  // Auto-generate commission when invoice is marked Paid
  if (body.status === "Paid" && updated.sourceBdoId) {
    const rate = 3;
    const commissionAmount = Math.round(updated.total * rate / 100);
    await db.insert(commissionsTable).values({
      bdoId: updated.sourceBdoId,
      bdoName: updated.sourceBdoId,
      invoiceRef: updated.invoiceRef,
      customerName: updated.customerName,
      projectValue: updated.total,
      rate,
      amount: commissionAmount,
      status: "Pending",
    }).onConflictDoNothing();
  }

  res.json({ invoice: updated });
});

// Record payment
router.post("/invoices/:invoiceRef/payments", requireAuth, requireRoles("Chief Admin", "Super Admin", "Finance", "Sales", "Sales Admin"), async (req, res) => {
  const user = req.session.user!;
  const body = req.body as Record<string, unknown>;

  const [invoice] = await db.select().from(invoicesTable).where(eq(invoicesTable.invoiceRef, req.params.invoiceRef)).limit(1);
  if (!invoice) { res.status(404).json({ error: "Invoice not found" }); return; }

  const [payment] = await db.insert(paymentsTable).values({
    invoiceRef: req.params.invoiceRef,
    customerId: invoice.customerId,
    amount: Number(body.amount),
    paymentMethod: String(body.paymentMethod ?? ""),
    reference: String(body.reference ?? ""),
    type: String(body.type ?? "full"),
    notes: String(body.notes ?? ""),
    recordedById: user.id,
  }).returning();

  // Check if fully paid
  const allPayments = await db.select().from(paymentsTable).where(eq(paymentsTable.invoiceRef, req.params.invoiceRef));
  const totalPaid = allPayments.reduce((s, p) => s + p.amount, 0);
  if (totalPaid >= invoice.total) {
    await db.update(invoicesTable).set({ status: "Paid", updatedAt: new Date() }).where(eq(invoicesTable.invoiceRef, req.params.invoiceRef));
  }

  res.status(201).json({ payment });
});

export default router;
