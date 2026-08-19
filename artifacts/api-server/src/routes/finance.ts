import { Router } from "express";
import { db } from "../lib/db.js";
import { invoicesTable, expensesTable, commissionsTable, paymentsTable } from "@workspace/db/schema";
import { gte, desc } from "drizzle-orm";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { customerNameForViewer } from "../lib/customer-access.js";

const router = Router();

router.get("/finance/summary", requireAuth, requireRoles("Chief Admin", "Super Admin", "Finance", "Management"), async (req, res) => {
  const user = req.session.user!;
  const [invoices, expenses, commissions, payments] = await Promise.all([
    db.select().from(invoicesTable).orderBy(desc(invoicesTable.createdAt)),
    db.select().from(expensesTable).orderBy(desc(expensesTable.date)),
    db.select().from(commissionsTable),
    db.select().from(paymentsTable),
  ]);

  const totalRevenue = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.total, 0);
  const totalReceivables = invoices.filter(i => i.status !== "Paid" && i.status !== "Draft").reduce((s, i) => s + i.total, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalCommissions = commissions.reduce((s, c) => s + c.amount, 0);
  const grossProfit = totalRevenue - (totalRevenue * 0.65); // 65% COGS estimate until full COGS tracking
  const netProfit = grossProfit - totalExpenses;

  const commissionsPaid = commissions.filter(c => c.status === "Paid").reduce((s, c) => s + c.amount, 0);
  const commissionsPending = commissions.filter(c => c.status === "Pending").reduce((s, c) => s + c.amount, 0);

  res.json({
    totalRevenue,
    totalReceivables,
    totalExpenses,
    grossProfit,
    netProfit,
    commissionsPaid,
    commissionsPending,
    invoiceCount: invoices.length,
    paidInvoiceCount: invoices.filter(i => i.status === "Paid").length,
    recentInvoices: invoices.slice(0, 5).map(invoice => ({
      ...invoice,
      customerName: customerNameForViewer(user, invoice),
    })),
    recentExpenses: expenses.slice(0, 5),
  });
});

export default router;
