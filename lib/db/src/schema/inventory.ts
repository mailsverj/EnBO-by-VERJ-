import { pgTable, text, serial, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const inventoryTable = pgTable("inventory", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  category: text("category").notNull(),
  specs: text("specs"),
  voltage: text("voltage"),
  capacityW: real("capacity_w"),
  capacityKw: real("capacity_kw"),
  capacityKwh: real("capacity_kwh"),
  currentRating: real("current_rating"), // for MCBs/MCCBs/RCDs in Amps
  voltageRating: real("voltage_rating"), // for SPDs
  breakerType: text("breaker_type"),     // Type B, Type C, gPV, etc.
  poleCount: integer("pole_count"),      // 1-pole, 2-pole, 4-pole
  sensitivityMa: real("sensitivity_ma"), // for RCDs (30, 100, 300 mA)
  costPrice: integer("cost_price").notNull().default(0),
  sellingPrice: integer("selling_price").notNull().default(0),
  stockQty: integer("stock_qty").notNull().default(0),
  qtyPurchased: integer("qty_purchased").notNull().default(0),
  qtySold: integer("qty_sold").notNull().default(0),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const priceAuditTable = pgTable("price_audit", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull(),
  productName: text("product_name").notNull(),
  field: text("field").notNull(), // costPrice | sellingPrice
  prevValue: integer("prev_value").notNull(),
  newValue: integer("new_value").notNull(),
  changedByName: text("changed_by_name").notNull(),
  changedById: integer("changed_by_id"),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
});

export const insertInventorySchema = createInsertSchema(inventoryTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InventoryItem = typeof inventoryTable.$inferSelect;
export type PriceAudit = typeof priceAuditTable.$inferSelect;
