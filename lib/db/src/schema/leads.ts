import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  leadRef: text("lead_ref").notNull().unique(), // LEAD-00482
  customerId: text("customer_id"),
  customerName: text("customer_name").notNull(),
  sourceBdoId: text("source_bdo_id").notNull(),
  assignedEngineerId: integer("assigned_engineer_id"),
  stage: text("stage").notNull().default("New Lead"),
  value: integer("value").notNull().default(0),
  notes: text("notes"),
  followUpDate: timestamp("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leadsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leadsTable.$inferSelect;
