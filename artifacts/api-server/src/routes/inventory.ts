import { Router } from "express";
import { db } from "../lib/db.js";
import { inventoryTable, priceAuditTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireRoles } from "../middleware/auth.js";

const router = Router();

const PRICE_ROLES = ["Chief Admin", "Super Admin", "Sales", "Sales Admin", "Finance", "Management"];

router.get("/inventory", requireAuth, async (req, res) => {
  const user = req.session.user!;
  const canSeePrices = user.roles.some(r => PRICE_ROLES.includes(r));
  const items = await db.select().from(inventoryTable).orderBy(inventoryTable.category, inventoryTable.brand);
  
  const filtered = items.map(item => {
    if (!canSeePrices) {
      const { costPrice: _c, sellingPrice: _s, ...rest } = item;
      return { ...rest, costPrice: null, sellingPrice: null };
    }
    return item;
  });
  res.json({ inventory: filtered, canSeePrices });
});

router.get("/inventory/:sku", requireAuth, async (req, res) => {
  const user = req.session.user!;
  const canSeePrices = user.roles.some(r => PRICE_ROLES.includes(r));
  const [item] = await db.select().from(inventoryTable).where(eq(inventoryTable.sku, req.params.sku)).limit(1);
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  const audit = await db.select().from(priceAuditTable).where(eq(priceAuditTable.sku, req.params.sku)).orderBy(desc(priceAuditTable.changedAt)).limit(20);
  if (!canSeePrices) {
    const { costPrice: _c, sellingPrice: _s, ...rest } = item;
    res.json({ item: { ...rest, costPrice: null, sellingPrice: null }, audit: canSeePrices ? audit : [] });
  } else {
    res.json({ item, audit });
  }
});

router.post("/inventory", requireAuth, requireRoles("Chief Admin", "Super Admin", "Sales", "Sales Admin"), async (req, res) => {
  const body = req.body as Partial<typeof inventoryTable.$inferInsert>;
  const [item] = await db.insert(inventoryTable).values(body as never).returning();
  res.status(201).json({ item });
});

router.patch("/inventory/:sku", requireAuth, requireRoles("Chief Admin", "Super Admin", "Sales", "Sales Admin"), async (req, res) => {
  const user = req.session.user!;
  const body = req.body as Partial<typeof inventoryTable.$inferInsert> & { costPrice?: number; sellingPrice?: number };

  // Get current values for audit
  const [current] = await db.select().from(inventoryTable).where(eq(inventoryTable.sku, req.params.sku)).limit(1);
  if (!current) { res.status(404).json({ error: "Not found" }); return; }

  // Record price changes in audit log
  const auditEntries: typeof priceAuditTable.$inferInsert[] = [];
  if (body.costPrice !== undefined && body.costPrice !== current.costPrice) {
    auditEntries.push({ sku: req.params.sku, productName: `${current.brand} ${current.model}`, field: "costPrice", prevValue: current.costPrice, newValue: body.costPrice, changedByName: user.name, changedById: user.id });
  }
  if (body.sellingPrice !== undefined && body.sellingPrice !== current.sellingPrice) {
    auditEntries.push({ sku: req.params.sku, productName: `${current.brand} ${current.model}`, field: "sellingPrice", prevValue: current.sellingPrice, newValue: body.sellingPrice, changedByName: user.name, changedById: user.id });
  }
  if (auditEntries.length > 0) {
    await db.insert(priceAuditTable).values(auditEntries);
  }

  const [updated] = await db.update(inventoryTable).set({ ...body, updatedAt: new Date() }).where(eq(inventoryTable.sku, req.params.sku)).returning();
  res.json({ item: updated });
});

router.get("/inventory/:sku/audit", requireAuth, requireRoles("Chief Admin", "Super Admin", "Sales", "Sales Admin", "Finance"), async (req, res) => {
  const audit = await db.select().from(priceAuditTable).where(eq(priceAuditTable.sku, req.params.sku)).orderBy(desc(priceAuditTable.changedAt));
  res.json({ audit });
});

export default router;
