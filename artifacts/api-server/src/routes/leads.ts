import { Router } from "express";
import { db } from "../lib/db.js";
import { leadsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/leads", requireAuth, async (req, res) => {
  const user = req.session.user!;
  const isBdo = user.roles.includes("BDO");
  const leads = isBdo && user.vbdoId
    ? await db.select().from(leadsTable).where(eq(leadsTable.sourceBdoId, user.vbdoId)).orderBy(desc(leadsTable.createdAt))
    : await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));
  res.json({ leads });
});

router.get("/leads/:leadRef", requireAuth, async (req, res) => {
  const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.leadRef, req.params.leadRef)).limit(1);
  if (!lead) { res.status(404).json({ error: "Not found" }); return; }
  const user = req.session.user!;
  if (user.roles.includes("BDO") && lead.sourceBdoId !== user.vbdoId) {
    res.status(404).json({ error: "Not found" }); return;
  }
  res.json({ lead });
});

router.post("/leads", requireAuth, async (req, res) => {
  const body = req.body as Record<string, string | number>;
  const existing = await db.select({ leadRef: leadsTable.leadRef }).from(leadsTable).orderBy(desc(leadsTable.id)).limit(1);
  const lastNum = existing[0] ? parseInt(existing[0].leadRef.replace("LEAD-", ""), 10) : 480;
  const leadRef = `LEAD-${String(lastNum + 1).padStart(5, "0")}`;
  const [lead] = await db.insert(leadsTable).values({ ...body as never, leadRef }).returning();
  res.status(201).json({ lead });
});

router.patch("/leads/:leadRef", requireAuth, async (req, res) => {
  const body = req.body as Partial<typeof leadsTable.$inferInsert>;
  const [updated] = await db.update(leadsTable).set({ ...body, updatedAt: new Date() }).where(eq(leadsTable.leadRef, req.params.leadRef)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ lead: updated });
});

export default router;
