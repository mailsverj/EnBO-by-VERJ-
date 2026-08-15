import { pgTable, text, serial, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const assessmentQuestionsTable = pgTable("assessment_questions", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options").notNull().$type<{ label: string; value: string }[]>(),
  correctOption: text("correct_option").notNull(),
  points: integer("points").notNull().default(1),
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

export type AssessmentQuestion = typeof assessmentQuestionsTable.$inferSelect;
export type AssessmentAttempt = typeof assessmentAttemptsTable.$inferSelect;
