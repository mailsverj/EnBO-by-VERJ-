import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";

export type ChapterBlock =
  | { type: "paragraph"; text: string }
  | { type: "callout"; variant: "tip" | "warning" | "key"; text: string }
  | { type: "list"; items: string[] }
  | { type: "cards"; columns?: 2 | 3; items: { title: string; subtitle?: string; body: string }[] }
  | { type: "keyterms"; terms: { term: string; def: string }[] }
  | { type: "formula"; label: string; formula: string; explanation: string }
  | { type: "steps"; items: { label: string; desc: string }[] }
  | { type: "pipeline"; items: string[] }
  | { type: "dodont"; dos: string[]; donts: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "objections"; items: { obj: string; res: string }[] }
  | { type: "assessment_cta" };

export type ChapterSection = { title: string; blocks: ChapterBlock[] };
export type ChapterContent = { sections: ChapterSection[] };

export const trainingChaptersTable = pgTable("training_chapters", {
  id: serial("id").primaryKey(),
  chapterId: text("chapter_id").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  content: jsonb("content").notNull().$type<ChapterContent>(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type TrainingChapter = typeof trainingChaptersTable.$inferSelect;
