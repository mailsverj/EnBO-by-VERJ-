import { Router } from "express";
import { db } from "../lib/db.js";
import { bdosTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireRoles } from "../middleware/auth.js";

const router = Router();

router.get("/bdos", requireAuth, async (_req, res) => {
  const bdos = await db.select().from(bdosTable).orderBy(desc(bdosTable.createdAt));
  res.json({ bdos });
});

router.get("/bdos/:vbdoId", requireAuth, async (req, res) => {
  const [bdo] = await db.select().from(bdosTable).where(eq(bdosTable.vbdoId, req.params.vbdoId)).limit(1);
  if (!bdo) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ bdo });
});

router.post("/bdos", requireAuth, requireRoles("Chief Admin", "Super Admin", "Recruitment/Admin"), async (req, res) => {
  const body = req.body as Record<string, string | number>;
  // Auto-generate VBDO ID
  const existing = await db.select({ vbdoId: bdosTable.vbdoId }).from(bdosTable).orderBy(desc(bdosTable.id)).limit(1);
  const lastNum = existing[0] ? parseInt(existing[0].vbdoId.replace("VBDO-", ""), 10) : 0;
  const vbdoId = `VBDO-${String(lastNum + 1).padStart(4, "0")}`;

  const [bdo] = await db.insert(bdosTable).values({ ...body as never, vbdoId }).returning();
  res.status(201).json({ bdo });
});

router.patch("/bdos/:vbdoId", requireAuth, requireRoles("Chief Admin", "Super Admin", "Recruitment/Admin"), async (req, res) => {
  const body = req.body as Partial<typeof bdosTable.$inferInsert>;
  const [updated] = await db.update(bdosTable).set({ ...body, updatedAt: new Date() }).where(eq(bdosTable.vbdoId, req.params.vbdoId)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ bdo: updated });
});

export default router;
