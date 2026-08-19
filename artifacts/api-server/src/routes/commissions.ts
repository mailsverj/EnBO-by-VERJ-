import { Router } from "express";
import { db } from "../lib/db.js";
import { commissionsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { hasBusinessCustomerAccess, isBdoScopedCustomerUser } from "../lib/customer-access.js";

const router = Router();

function visibleCommissionForUser<T extends typeof commissionsTable.$inferSelect>(
  user: NonNullable<Express.Request["session"]["user"]>,
  commission: T,
) {
  const canViewIdentity = hasBusinessCustomerAccess(user)
    || (user.roles.includes("BDO") && commission.bdoId === user.vbdoId);
  return canViewIdentity ? commission : { ...commission, customerName: null };
}

router.get("/commissions", requireAuth, async (req, res) => {
  const user = req.session.user!;
  if (!isBdoScopedCustomerUser(user) && !hasBusinessCustomerAccess(user)) {
    res.status(403).json({ error: "Your role cannot view customer commissions" });
    return;
  }
  const commissions = isBdoScopedCustomerUser(user)
    ? user.vbdoId
      ? await db.select().from(commissionsTable).where(eq(commissionsTable.bdoId, user.vbdoId)).orderBy(desc(commissionsTable.createdAt))
      : []
    : await db.select().from(commissionsTable).orderBy(desc(commissionsTable.createdAt));
  res.json({ commissions: commissions.map(commission => visibleCommissionForUser(user, commission)) });
});

router.patch("/commissions/:id", requireAuth, requireRoles("Chief Admin", "Super Admin", "Finance"), async (req, res) => {
  const { status } = req.body as { status: string };
  const id = parseInt(req.params.id, 10);
  const update: Partial<typeof commissionsTable.$inferInsert> = { status };
  if (status === "Paid") update.paidAt = new Date();
  const [updated] = await db.update(commissionsTable).set(update).where(eq(commissionsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ commission: visibleCommissionForUser(req.session.user!, updated) });
});

export default router;
