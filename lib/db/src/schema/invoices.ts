import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const invoicesTable = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceRef: text("invoice_ref").notNull().unique(), // INV-2026-00482
  customerId: text("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  leadRef: text("lead_ref"),
  designRef: text("design_ref"),
  sourceBdoId: text("source_bdo_id"),
  engineerId: integer("engineer_id"),
  planName: text("plan_name"),
  lineItems: jsonb("line_items"), // array of { desc, qty, unitPrice, category }
  subtotal: integer("subtotal").notNull().default(0),
  total: integer("total").notNull().default(0),
  status: text("status").notNull().default("Draft"),
  approvedById: integer("approved_by_id"),
  approvedByName: text("approved_by_name"),
  issuedAt: timestamp("issued_at"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceRef: text("invoice_ref").notNull(),
  customerId: text("customer_id").notNull(),
  amount: integer("amount").notNull(),
  paymentMethod: text("payment_method"),
  reference: text("reference"),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  type: text("type").notNull().default("full"), // full | partial
  notes: text("notes"),
  recordedById: integer("recorded_by_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commissionsTable = pgTable("commissions", {
  id: serial("id").primaryKey(),
  bdoId: text("bdo_id").notNull(),
  bdoName: text("bdo_name").notNull(),
  invoiceRef: text("invoice_ref").notNull(),
  customerName: text("customer_name"),
  projectValue: integer("project_value").notNull(),
  rate: integer("rate").notNull().default(3), // percent
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("Pending"), // Pending | Paid
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoicesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoicesTable.$inferSelect;
export type Payment = typeof paymentsTable.$inferSelect;
export type Commission = typeof commissionsTable.$inferSelect;
