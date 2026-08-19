import { Router } from "express";
import { db } from "../lib/db.js";
import { invoicesTable, paymentsTable, commissionsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { generateInvoicePdf } from "../lib/invoice-pdf.js";
import { Resend } from "resend";
import { canViewCustomerContacts, customerNameForViewer, isBdoScopedCustomerUser } from "../lib/customer-access.js";

const router = Router();

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}
const FROM = process.env.EMAIL_FROM ?? "VERJ Solar <mails@verj.ng>";
const INVOICE_MANAGER_ROLES = ["Chief Admin", "Super Admin", "Sales", "Sales Admin", "Finance", "Management"];

function visibleInvoiceForUser<T extends typeof invoicesTable.$inferSelect>(
  user: NonNullable<Express.Request["session"]["user"]>,
  invoice: T,
) {
  return canViewCustomerContacts(user, invoice)
    ? invoice
    : { ...invoice, customerName: customerNameForViewer(user, invoice) };
}

function canAccessInvoice(user: NonNullable<Express.Request["session"]["user"]>, invoice: typeof invoicesTable.$inferSelect) {
  return !isBdoScopedCustomerUser(user) || invoice.sourceBdoId === user.vbdoId;
}

const WARRANTY_LABELS: Record<string, string> = {
  battery_10y: "Battery: 10-year manufacturer warranty",
  battery_5y: "5-year manufacturer warranty",
  battery_2y: "2-year manufacturer warranty",
  workmanship_12m: "12-month VERJ warranty on workmanship",
};

// ── List all invoices ──
router.get("/invoices", requireAuth, async (req, res) => {
  const user = req.session.user!;
  const invoices = isBdoScopedCustomerUser(user)
    ? user.vbdoId
      ? await db.select().from(invoicesTable).where(eq(invoicesTable.sourceBdoId, user.vbdoId)).orderBy(desc(invoicesTable.createdAt))
      : []
    : await db.select().from(invoicesTable).orderBy(desc(invoicesTable.createdAt));
  const visibleInvoices = invoices.map(invoice => visibleInvoiceForUser(user, invoice));
  res.json({ invoices: visibleInvoices });
});

// ── Get single invoice ──
router.get("/invoices/:invoiceRef", requireAuth, async (req, res) => {
  const [invoice] = await db.select().from(invoicesTable).where(eq(invoicesTable.invoiceRef, req.params.invoiceRef)).limit(1);
  if (!invoice) { res.status(404).json({ error: "Not found" }); return; }
  const user = req.session.user!;
  if (!canAccessInvoice(user, invoice)) { res.status(404).json({ error: "Not found" }); return; }
  const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.invoiceRef, req.params.invoiceRef)).orderBy(desc(paymentsTable.createdAt));
  const amountPaid = payments.reduce((s, p) => s + p.amount, 0);
  res.json({ invoice: visibleInvoiceForUser(user, invoice), payments, amountPaid, balance: invoice.total - amountPaid });
});

// ── Download PDF ──
router.get("/invoices/:invoiceRef/pdf", requireAuth, async (req, res) => {
  const user = req.session.user!;
  const [invoice] = await db.select().from(invoicesTable).where(eq(invoicesTable.invoiceRef, req.params.invoiceRef)).limit(1);
  if (!invoice) { res.status(404).json({ error: "Not found" }); return; }
  if (!canAccessInvoice(user, invoice)) { res.status(404).json({ error: "Not found" }); return; }
  if (!canViewCustomerContacts(user, invoice)) {
    res.status(403).json({ error: "Your role cannot download customer invoices" });
    return;
  }

  const lineItems = Array.isArray(invoice.lineItems)
    ? (invoice.lineItems as Array<{ desc: string; qty: number; unitPrice: number; category?: string }>)
    : [];

  const policies = Array.isArray(invoice.warrantyPolicies)
    ? (invoice.warrantyPolicies as string[]).map(k => WARRANTY_LABELS[k] ?? k)
    : [];

  const pdf = await generateInvoicePdf({
    invoiceRef: invoice.invoiceRef,
    customerName: invoice.customerName,
    sourceBdoId: invoice.sourceBdoId,
    leadRef: invoice.leadRef,
    planName: invoice.planName,
    lineItems,
    subtotal: invoice.subtotal,
    total: invoice.total,
    dueDate: invoice.dueDate?.toString() ?? null,
    createdAt: invoice.createdAt.toString(),
    approvedByName: invoice.approvedByName,
    issuedAt: invoice.issuedAt?.toString() ?? null,
    warrantyPolicies: policies,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoiceRef}.pdf"`);
  res.send(pdf);
});

// ── Create invoice ──
router.post("/invoices", requireAuth, requireRoles("Chief Admin", "Super Admin", "Sales", "Sales Admin", "Lead Technical Officer"), async (req, res) => {
  const user = req.session.user!;
  const body = req.body as Record<string, unknown>;
  const existing = await db.select({ invoiceRef: invoicesTable.invoiceRef }).from(invoicesTable).orderBy(desc(invoicesTable.id)).limit(1);
  const lastNum = existing[0] ? parseInt(existing[0].invoiceRef.split("-")[2] ?? "480", 10) : 480;
  const year = new Date().getFullYear();
  const invoiceRef = `INV-${year}-${String(lastNum + 1).padStart(5, "0")}`;
  const [invoice] = await db.insert(invoicesTable).values({ ...body as never, invoiceRef }).returning();
  res.status(201).json({ invoice: visibleInvoiceForUser(user, invoice) });
});

// ── Update invoice (including approval which triggers PDF email) ──
router.patch("/invoices/:invoiceRef", requireAuth, async (req, res) => {
  const user = req.session.user!;
  if (!user.roles.some(role => INVOICE_MANAGER_ROLES.includes(role))) {
    res.status(403).json({ error: "Your role cannot update invoices" });
    return;
  }
  const [existing] = await db.select().from(invoicesTable).where(eq(invoicesTable.invoiceRef, req.params.invoiceRef)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (!canAccessInvoice(user, existing)) { res.status(404).json({ error: "Not found" }); return; }
  const body = req.body as Partial<typeof invoicesTable.$inferInsert>;

  if (body.status === "Approved") {
    const canApprove = user.roles.some(r => ["Chief Admin", "Super Admin", "Sales", "Sales Admin"].includes(r));
    if (!canApprove) { res.status(403).json({ error: "Not authorised to approve invoices" }); return; }
    body.approvedById = user.id;
    body.approvedByName = user.name;
    body.issuedAt = new Date();
  }

  const [updated] = await db.update(invoicesTable).set({ ...body, updatedAt: new Date() }).where(eq(invoicesTable.invoiceRef, req.params.invoiceRef)).returning();

  // Auto-commission when paid
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

  // Auto-email PDF when approved/issued
  if (body.status === "Approved" && updated.customerName) {
    try {
      const lineItems = Array.isArray(updated.lineItems)
        ? (updated.lineItems as Array<{ desc: string; qty: number; unitPrice: number; category?: string }>)
        : [];

      const policies = Array.isArray(updated.warrantyPolicies)
        ? (updated.warrantyPolicies as string[]).map(k => WARRANTY_LABELS[k] ?? k)
        : [];

      const pdf = await generateInvoicePdf({
        invoiceRef: updated.invoiceRef,
        customerName: updated.customerName,
        sourceBdoId: updated.sourceBdoId,
        leadRef: updated.leadRef,
        planName: updated.planName,
        lineItems,
        subtotal: updated.subtotal,
        total: updated.total,
        dueDate: updated.dueDate?.toString() ?? null,
        createdAt: updated.createdAt.toString(),
        approvedByName: updated.approvedByName,
        issuedAt: updated.issuedAt?.toString() ?? null,
        warrantyPolicies: policies,
      });

      // We need a customer email to send — look it up from customers table if available.
      // For now we log and skip if no email is resolvable; the PDF download endpoint
      // always works for manual sending.
      const resend = getResend();
      await resend.emails.send({
        from: FROM,
        to: ["mails@verj.ng"], // internal copy — replace with customer email when customer lookup is wired
        subject: `Invoice ${updated.invoiceRef} — ${updated.customerName}`,
        html: `<p>Please find attached the approved invoice <strong>${updated.invoiceRef}</strong> for <strong>${updated.customerName}</strong>.</p><p>Total: ₦${updated.total.toLocaleString("en-NG")}</p>`,
        attachments: [{ filename: `${updated.invoiceRef}.pdf`, content: pdf.toString("base64") }],
      });
    } catch (err) {
      // Non-fatal — invoice is still approved
      console.error("Invoice PDF email failed:", err);
    }
  }

  res.json({ invoice: visibleInvoiceForUser(user, updated) });
});

// ── Record payment ──
router.post("/invoices/:invoiceRef/payments", requireAuth, requireRoles("Chief Admin", "Super Admin", "Finance", "Sales", "Sales Admin"), async (req, res) => {
  const user = req.session.user!;
  const body = req.body as Record<string, unknown>;

  const [invoice] = await db.select().from(invoicesTable).where(eq(invoicesTable.invoiceRef, req.params.invoiceRef)).limit(1);
  if (!invoice) { res.status(404).json({ error: "Invoice not found" }); return; }
  if (!canAccessInvoice(user, invoice)) { res.status(404).json({ error: "Not found" }); return; }

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

  const allPayments = await db.select().from(paymentsTable).where(eq(paymentsTable.invoiceRef, req.params.invoiceRef));
  const totalPaid = allPayments.reduce((s, p) => s + p.amount, 0);
  if (totalPaid >= invoice.total) {
    await db.update(invoicesTable).set({ status: "Paid", updatedAt: new Date() }).where(eq(invoicesTable.invoiceRef, req.params.invoiceRef));
  }

  res.status(201).json({ payment });
});

export default router;
