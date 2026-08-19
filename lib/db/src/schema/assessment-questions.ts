import { pgTable, text, serial, boolean, integer, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

export const assessmentQuestionsTable = pgTable("assessment_questions", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options").notNull().$type<{ label: string; value: string }[]>(),
  correctOption: text("correct_option").notNull(),
  points: integer("points").notNull().default(1),
  marks: integer("marks").notNull().default(3),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assessmentAttemptsTable = pgTable("assessment_attempts", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").notNull(),
  appRef: text("app_ref").notNull(),
  answers: jsonb("answers").notNull().$type<Record<number, string>>(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  passed: boolean("passed").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

/**
 * One in-progress assessment per application. This is deliberately separate
 * from completed attempts so saving a draft never records or consumes one.
 */
export const assessmentDraftsTable = pgTable("assessment_drafts", {
  id: serial("id").primaryKey(),
  appId: integer("app_id").notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  revision: integer("revision").notNull().default(0),
  questionBankSignature: text("question_bank_signature").notNull(),
  answers: jsonb("answers").notNull().$type<Record<number, string>>(),
  currentQuestionId: integer("current_question_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [
  uniqueIndex("assessment_drafts_app_attempt_unique").on(table.appId, table.attemptNumber),
]);

export type AssessmentQuestion = typeof assessmentQuestionsTable.$inferSelect;
export type AssessmentAttempt = typeof assessmentAttemptsTable.$inferSelect;
export type AssessmentDraft = typeof assessmentDraftsTable.$inferSelect;
