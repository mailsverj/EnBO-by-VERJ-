import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bdoApplicationsTable = pgTable("bdo_applications", {
  id: serial("id").primaryKey(),
  refId: text("ref_id").notNull().unique(), // e.g. APP-001
  // Step 1 — Personal
  title: text("title"),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  whatsappNumber: text("whatsapp_number"),
  gender: text("gender"),
  dob: text("dob"),
  state: text("state"),
  lga: text("lga"),
  address: text("address"),
  education: text("education"),
  occupation: text("occupation"),
  // Step 2 — Documents & Banking
  photoUrl: text("photo_url"),
  idDocumentUrl: text("id_document_url"),
  nin: text("nin"),
  bvn: text("bvn"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  accountName: text("account_name"),
  guarantorName: text("guarantor_name"),
  guarantorPhone: text("guarantor_phone"),
  guarantorRelationship: text("guarantor_relationship"),
  guarantorAddress: text("guarantor_address"),
  // Step 2 — Business & Operating
  coverageAreas: text("coverage_areas"),
  hasOffice: text("has_office"),
  officeAddress: text("office_address"),
  officeCurrentUse: text("office_current_use"),
  wantsVerjSticker: text("wants_verj_sticker"),
  employerName: text("employer_name"),
  hasSalesExperience: text("has_sales_experience"),
  previousSalesDetail: text("previous_sales_detail"),
  // Step 3 — KYC & Declaration
  referralSource: text("referral_source"),
  salesExperience: text("sales_experience"),
  statement: text("statement"),
  // KYC & Assessment tracking
  kycStatus: text("kyc_status").notNull().default("Not Started"),
  // KYC Pending | KYC Verified | KYC Resubmission Required
  assessmentStatus: text("assessment_status").notNull().default("Not Started"),
  // Not Started | Passed | Failed
  assessmentScore: integer("assessment_score"),
  assessmentTotal: integer("assessment_total"),
  assessmentPassed: boolean("assessment_passed"),
  assessmentCompletedAt: timestamp("assessment_completed_at"),
  shortlistedAt: timestamp("shortlisted_at"),
  // Admin fields
  status: text("status").notNull().default("Submitted"),
  // Submitted | KYC Pending | KYC Resubmission Required | Shortlisted |
  // Assessment Passed | Assessment Failed | Activated | Rejected
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
