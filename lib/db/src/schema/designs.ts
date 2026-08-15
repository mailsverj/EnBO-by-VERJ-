import { pgTable, text, serial, integer, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const designsTable = pgTable("designs", {
  id: serial("id").primaryKey(),
  designRef: text("design_ref").notNull().unique(), // DESIGN-00192
  leadRef: text("lead_ref"),
  customerId: text("customer_id"),
  customerName: text("customer_name"),
  sourceBdoId: text("source_bdo_id"),
  assignedEngineerId: integer("assigned_engineer_id"),
  lockedById: integer("locked_by_id"),
  lockStartedAt: timestamp("lock_started_at"),
  status: text("status").notNull().default("Pending"),
  systemSize: text("system_size"),
  totalLoad: real("total_load"),
  totalNightEnergy: real("total_night_energy"),
  batteryKwh: real("battery_kwh"),
  pvKwp: real("pv_kwp"),
  inverterKw: real("inverter_kw"),
  components: jsonb("components"), // selected components JSON
  appliances: jsonb("appliances"),  // appliance list JSON
  pvCableSize: text("pv_cable_size"),
  pvCableLength: real("pv_cable_length"),
  acCableSize: text("ac_cable_size"),
  acCableLength: real("ac_cable_length"),
  batCableSize: text("bat_cable_size"),
  batCableLength: real("bat_cable_length"),
  submittedAt: timestamp("submitted_at"),
  approvedById: integer("approved_by_id"),
  approvalDate: timestamp("approval_date"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const designHistoryTable = pgTable("design_history", {
  id: serial("id").primaryKey(),
  designRef: text("design_ref").notNull(),
  engineerId: integer("engineer_id"),
  engineerName: text("engineer_name"),
  action: text("action").notNull(),
  note: text("note"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

export const insertDesignSchema = createInsertSchema(designsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDesign = z.infer<typeof insertDesignSchema>;
export type Design = typeof designsTable.$inferSelect;
export type DesignHistory = typeof designHistoryTable.$inferSelect;
