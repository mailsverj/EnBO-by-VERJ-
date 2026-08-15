import { Router } from "express";
import { db } from "../lib/db.js";
import { commissionsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireRoles } from "../middleware/auth.js";

const router = Router();

router.get("/commissions", requireAuth, async (_req, res) => {
  const commissions = await db.select().from(commissionsTable).orderBy(desc(commissionsTable.createdAt));
  res.json({ commissions });
});

router.patch("/commissions/:id", requireAuth, requireRoles("Chief Admin", "Super Admin", "Finance"), async (req, res) => {
  const { status } = req.body as { status: string };
  const id = parseInt(req.params.id, 10);
  const update: Partial<typeof commissionsTable.$inferInsert> = { status };
  if (status === "Paid") update.paidAt = new Date();
  const [updated] = await db.update(commissionsTable).set(update).where(eq(commissionsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ commission: updated });
});

export default router;
