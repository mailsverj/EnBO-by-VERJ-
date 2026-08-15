import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const customersTable = pgTable("customers", {
  id: serial("id").primaryKey(),
  cidRef: text("cid_ref").notNull().unique(), // CID-000001
  name: text("name").notNull(),
  type: text("type").notNull().default("Individual"), // Individual | Business
  location: text("location"),
  email: text("email"),
  phone: text("phone"),
  sourceBdoId: text("source_bdo_id"),
  leadCount: integer("lead_count").notNull().default(0),
  projectCount: integer("project_count").notNull().default(0),
  totalValue: integer("total_value").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCustomerSchema = createInsertSchema(customersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customersTable.$inferSelect;
