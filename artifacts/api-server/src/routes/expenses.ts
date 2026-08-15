import { Router } from "express";
import { db } from "../lib/db.js";
import { expensesTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireRoles } from "../middleware/auth.js";

const router = Router();

const FINANCE_ROLES = ["Chief Admin", "Super Admin", "Finance", "Management"];

router.get("/expenses", requireAuth, requireRoles(...FINANCE_ROLES), async (_req, res) => {
  const expenses = await db.select().from(expensesTable).orderBy(desc(expensesTable.date));
  res.json({ expenses });
});

router.post("/expenses", requireAuth, requireRoles(...FINANCE_ROLES), async (req, res) => {
  const user = req.session.user!;
  const body = req.body as Record<string, string | number>;
  const [expense] = await db.insert(expensesTable).values({
    category: String(body.category),
    description: String(body.description),
    amount: Number(body.amount),
    paymentMethod: String(body.paymentMethod ?? ""),
    vendor: String(body.vendor ?? ""),
    notes: String(body.notes ?? ""),
    date: body.date ? new Date(String(body.date)) : new Date(),
    createdById: user.id,
    createdByName: user.name,
  }).returning();
  res.status(201).json({ expense });
});

router.patch("/expenses/:id", requireAuth, requireRoles(...FINANCE_ROLES), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const body = req.body as Partial<typeof expensesTable.$inferInsert>;
  const [updated] = await db.update(expensesTable).set(body).where(eq(expensesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ expense: updated });
});

router.delete("/expenses/:id", requireAuth, requireRoles("Chief Admin", "Super Admin"), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await db.delete(expensesTable).where(eq(expensesTable.id, id));
  res.json({ ok: true });
});

export default router;
