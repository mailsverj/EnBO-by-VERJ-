import { Router } from "express";
import { db } from "../lib/db.js";
import { customersTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { REFERENCE_ALLOCATION_LOCK_ID } from "../lib/reference-locks.js";
import {
  canViewCustomerContacts,
  customerIdOnly,
  hasBusinessCustomerAccess,
  isBdoScopedCustomerUser,
} from "../lib/customer-access.js";

const router = Router();

router.get("/customers", requireAuth, async (req, res) => {
  const user = req.session.user!;
  const customers = isBdoScopedCustomerUser(user)
    ? user.vbdoId
      ? await db.select().from(customersTable).where(eq(customersTable.sourceBdoId, user.vbdoId)).orderBy(desc(customersTable.createdAt))
      : []
    : await db.select().from(customersTable).orderBy(desc(customersTable.createdAt));
  res.json({
    customers: customers.map(customer =>
      canViewCustomerContacts(user, customer) ? customer : customerIdOnly(customer),
    ),
  });
});

router.get("/customers/:cidRef", requireAuth, async (req, res) => {
  const [customer] = await db.select().from(customersTable).where(eq(customersTable.cidRef, req.params.cidRef)).limit(1);
  if (!customer) { res.status(404).json({ error: "Not found" }); return; }
  const user = req.session.user!;
  if (isBdoScopedCustomerUser(user) && customer.sourceBdoId !== user.vbdoId) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ customer: canViewCustomerContacts(user, customer) ? customer : customerIdOnly(customer) });
});

router.post("/customers", requireAuth, async (req, res) => {
  const user = req.session.user!;
  if (!hasBusinessCustomerAccess(user) && !user.roles.includes("BDO")) {
    res.status(403).json({ error: "Your role cannot create customers" });
    return;
  }

  const body = req.body as Record<string, string | number>;
  if (isBdoScopedCustomerUser(user)) {
    if (!user.vbdoId) {
      res.status(400).json({ error: "Your account is missing a VBDO ID" });
      return;
    }
    body.sourceBdoId = user.vbdoId;
  }

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
  const user = req.session.user!;
  const [existing] = await db.select().from(customersTable).where(eq(customersTable.cidRef, req.params.cidRef)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (!canViewCustomerContacts(user, existing)) {
    res.status(403).json({ error: "Your role cannot update this customer" });
    return;
  }

  const body = req.body as Partial<typeof customersTable.$inferInsert>;
  if (isBdoScopedCustomerUser(user) && body.sourceBdoId !== undefined) {
    res.status(400).json({ error: "BDOs cannot reassign customer ownership" });
    return;
  }
  const [updated] = await db.update(customersTable).set({ ...body, updatedAt: new Date() }).where(eq(customersTable.cidRef, req.params.cidRef)).returning();
  res.json({ customer: updated });
});

export default router;
