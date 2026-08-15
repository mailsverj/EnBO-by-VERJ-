import { Router } from "express";
import { db } from "../lib/db.js";
import { designsTable, designHistoryTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const LOCK_TIMEOUT_MS = 3 * 60 * 60 * 1000; // 3 hours

router.get("/designs", requireAuth, async (_req, res) => {
  const designs = await db.select().from(designsTable).orderBy(desc(designsTable.createdAt));
  // Auto-release stale locks
  const now = Date.now();
  const released = designs.map(d => {
    if (d.lockedById && d.lockStartedAt && now - d.lockStartedAt.getTime() > LOCK_TIMEOUT_MS) {
      return { ...d, lockedById: null, lockStartedAt: null };
    }
    return d;
  });
  res.json({ designs: released });
});

router.get("/designs/:designRef", requireAuth, async (req, res) => {
  const [design] = await db.select().from(designsTable).where(eq(designsTable.designRef, req.params.designRef)).limit(1);
  if (!design) { res.status(404).json({ error: "Not found" }); return; }
  const history = await db.select().from(designHistoryTable).where(eq(designHistoryTable.designRef, req.params.designRef)).orderBy(desc(designHistoryTable.startedAt));
  res.json({ design, history });
});

router.post("/designs", requireAuth, async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const existing = await db.select({ designRef: designsTable.designRef }).from(designsTable).orderBy(desc(designsTable.id)).limit(1);
  const lastNum = existing[0] ? parseInt(existing[0].designRef.replace("DESIGN-", ""), 10) : 190;
  const designRef = `DESIGN-${String(lastNum + 1).padStart(5, "0")}`;
  const [design] = await db.insert(designsTable).values({ ...body as never, designRef }).returning();
  res.status(201).json({ design });
});

router.patch("/designs/:designRef", requireAuth, async (req, res) => {
  const body = req.body as Partial<typeof designsTable.$inferInsert>;
  const [updated] = await db.update(designsTable).set({ ...body, updatedAt: new Date() }).where(eq(designsTable.designRef, req.params.designRef)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ design: updated });
});

// Lock design for current engineer
router.post("/designs/:designRef/lock", requireAuth, async (req, res) => {
  const user = req.session.user!;
  const [existing] = await db.select().from(designsTable).where(eq(designsTable.designRef, req.params.designRef)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  // Check if already locked by someone else and lock hasn't expired
  if (existing.lockedById && existing.lockedById !== user.id && existing.lockStartedAt) {
    const age = Date.now() - existing.lockStartedAt.getTime();
    if (age < LOCK_TIMEOUT_MS) {
      res.status(409).json({ error: "Design is locked by another engineer" });
      return;
    }
  }

  const [design] = await db.update(designsTable).set({
    lockedById: user.id,
    lockStartedAt: new Date(),
    status: "In Progress",
    updatedAt: new Date(),
  }).where(eq(designsTable.designRef, req.params.designRef)).returning();

  await db.insert(designHistoryTable).values({
    designRef: req.params.designRef,
    engineerId: user.id,
    engineerName: user.name,
    action: "Took ownership",
    startedAt: new Date(),
  });

  res.json({ design });
});

// Release lock
router.post("/designs/:designRef/unlock", requireAuth, async (req, res) => {
  const [design] = await db.update(designsTable).set({
    lockedById: null,
    lockStartedAt: null,
    updatedAt: new Date(),
  }).where(eq(designsTable.designRef, req.params.designRef)).returning();
  res.json({ design });
});

export default router;
