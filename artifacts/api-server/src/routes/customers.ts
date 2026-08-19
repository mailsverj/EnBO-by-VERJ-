import { Router } from "express";
import { db } from "../lib/db.js";
import { customersTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { REFERENCE_ALLOCATION_LOCK_ID } from "../lib/reference-locks.js";

const router = Router();

router.get("/customers", requireAuth, async (_req, res) => {
  const customers = await db.select().from(customersTable).orderBy(desc(customersTable.createdAt));
  res.json({ customers });
});

router.get("/customers/:cidRef", requireAuth, async (req, res) => {
  const [customer] = await db.select().from(customersTable).where(eq(customersTable.cidRef, req.params.cidRef)).limit(1);
  if (!customer) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ customer });
});

router.post("/customers", requireAuth, async (req, res) => {
  const body = req.body as Record<string, string | number>;
  const customer = await db.transaction(async tx => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${REFERENCE_ALLOCATION_LOCK_ID})`);
    const existing = await tx.select({ cidRef: customersTable.cidRef }).from(customersTable).orderBy(desc(customersTable.id)).limit(1);
    const lastNum = existing[0] ? parseInt(existing[0].cidRef.replace("CID-", ""), 10) : 0;
    const cidRef = `CID-${String(lastNum + 1).padStart(6, "0")}`;
    const [createdCustomer] = await tx.insert(customersTable).values({ ...body as never, cidRef }).returning();
    return createdCustomer;
  });
  res.status(201).json({ customer });
});

router.patch("/customers/:cidRef", requireAuth, async (req, res) => {
  const body = req.body as Partial<typeof customersTable.$inferInsert>;
  const [updated] = await db.update(customersTable).set({ ...body, updatedAt: new Date() }).where(eq(customersTable.cidRef, req.params.cidRef)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ customer: updated });
});

export default router;
