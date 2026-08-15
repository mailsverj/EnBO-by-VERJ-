import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bdosTable = pgTable("bdos", {
  id: serial("id").primaryKey(),
  vbdoId: text("vbdo_id").notNull().unique(),
  userId: integer("user_id"), // link to users table when activated
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  location: text("location"),
  status: text("status").notNull().default("Pending"), // Active | Pending | Inactive
  assignedEngineerId: integer("assigned_engineer_id"),
  username: text("username"),
  leadsCount: integer("leads_count").notNull().default(0),
  totalValue: integer("total_value").notNull().default(0),
  commissionEarned: integer("commission_earned").notNull().default(0),
  birthday: text("birthday"),
  applicationId: integer("application_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBdoSchema = createInsertSchema(bdosTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBdo = z.infer<typeof insertBdoSchema>;
export type Bdo = typeof bdosTable.$inferSelect;
