import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bdoApplicationsTable = pgTable("bdo_applications", {
  id: serial("id").primaryKey(),
  refId: text("ref_id").notNull().unique(), // e.g. APP-001
  // Step 1
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  gender: text("gender"),
  dob: text("dob"),
  state: text("state"),
  lga: text("lga"),
  address: text("address"),
  // Step 2
  nin: text("nin"),
  bvn: text("bvn"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  accountName: text("account_name"),
  guarantorName: text("guarantor_name"),
  guarantorPhone: text("guarantor_phone"),
  guarantorRelationship: text("guarantor_relationship"),
  guarantorAddress: text("guarantor_address"),
  // Step 3
  referralSource: text("referral_source"),
  salesExperience: text("sales_experience"),
  statement: text("statement"),
  // Admin fields
  status: text("status").notNull().default("Submitted"),
  adminNotes: text("admin_notes"),
  assignedEngineerId: text("assigned_engineer_id"),
  generatedUsername: text("generated_username"),
  activatedAt: timestamp("activated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertApplicationSchema = createInsertSchema(bdoApplicationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof bdoApplicationsTable.$inferSelect;
