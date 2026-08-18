import { Router } from "express";
import { db } from "../lib/db.js";
import {
  assessmentQuestionsTable,
  trainingChaptersTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { CHAPTER_SEED } from "../lib/chapter-seed-data.js";

const router = Router();
const ADMIN_ROLES = ["Chief Admin", "Super Admin"];
const OPTION_KEYS = ["a", "b", "c", "d"];

function optionIndex(value: string | null | undefined): number {
  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric >= 0) return numeric;
  const letterIndex = OPTION_KEYS.indexOf((value ?? "").toLowerCase());
  return letterIndex >= 0 ? letterIndex : 0;
}

function adminOptions(options: unknown): { label: string; value: string }[] {
  if (!Array.isArray(options)) return [];
  return options.map((option, index) => ({
    label: typeof option === "string"
      ? option
      : String((option as { label?: unknown; value?: unknown })?.label
        ?? (option as { value?: unknown })?.value
        ?? ""),
    value: OPTION_KEYS[index] ?? String(index),
  }));
}

function adminQuestion<T extends { options: unknown; correctOption: string }>(question: T) {
  const correctIndex = optionIndex(question.correctOption);
  return {
    ...question,
    options: adminOptions(question.options),
    correctOption: OPTION_KEYS[correctIndex] ?? "a",
  };
}

// ─── Assessment Questions ────────────────────────────────────────────────────

// List all questions (including inactive)
router.get(
  "/admin/questions",
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (_req, res) => {
    const questions = await db
      .select()
      .from(assessmentQuestionsTable)
      .orderBy(assessmentQuestionsTable.id);
    res.json({ questions: questions.map(adminQuestion) });
  }
);

// Create question
router.post(
  "/admin/questions",
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res) => {
    const { category, questionText, options, correctOption, marks, active } =
      req.body as {
        category: string;
        questionText: string;
        options: { label: string; value: string }[];
        correctOption: string;
        marks: number;
        active?: boolean;
      };

    if (!category || !questionText || !options?.length || !correctOption) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const [q] = await db
      .insert(assessmentQuestionsTable)
      .values({
        category,
        questionText,
        options: adminOptions(options),
        correctOption: String(optionIndex(correctOption)),
        marks: marks ?? 3,
        active: active ?? true,
      })
      .returning();
    res.status(201).json({ question: adminQuestion(q) });
  }
);

// Update question
router.patch(
  "/admin/questions/:id",
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res) => {
    const id = Number(req.params.id);
    const { category, questionText, options, correctOption, marks, active } =
      req.body as Partial<{
        category: string;
        questionText: string;
        options: { label: string; value: string }[];
        correctOption: string;
        marks: number;
        active: boolean;
      }>;

    const updates: Record<string, unknown> = {};
    if (category !== undefined) updates.category = category;
    if (questionText !== undefined) updates.questionText = questionText;
    if (options !== undefined) updates.options = adminOptions(options);
    if (correctOption !== undefined) updates.correctOption = String(optionIndex(correctOption));
    if (marks !== undefined) updates.marks = marks;
    if (active !== undefined) updates.active = active;

    if (!Object.keys(updates).length) {
      res.status(400).json({ error: "Nothing to update" });
      return;
    }

    const [q] = await db
      .update(assessmentQuestionsTable)
      .set(updates)
      .where(eq(assessmentQuestionsTable.id, id))
      .returning();

    if (!q) { res.status(404).json({ error: "Question not found" }); return; }
    res.json({ question: adminQuestion(q) });
  }
);

// Delete question
router.delete(
  "/admin/questions/:id",
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res) => {
    const id = Number(req.params.id);
    const [deleted] = await db
      .delete(assessmentQuestionsTable)
      .where(eq(assessmentQuestionsTable.id, id))
      .returning();
    if (!deleted) { res.status(404).json({ error: "Question not found" }); return; }
    res.json({ ok: true });
  }
);

// ─── Training Chapters ───────────────────────────────────────────────────────

// List all chapters (summary — no full content)
router.get(
  "/admin/training",
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (_req, res) => {
    const chapters = await db
      .select({
        id: trainingChaptersTable.id,
        chapterId: trainingChaptersTable.chapterId,
        title: trainingChaptersTable.title,
        subtitle: trainingChaptersTable.subtitle,
        updatedAt: trainingChaptersTable.updatedAt,
      })
      .from(trainingChaptersTable)
      .orderBy(trainingChaptersTable.id);
    res.json({ chapters });
  }
);

// Get single chapter with full content
router.get(
  "/admin/training/:chapterId",
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res) => {
    const [ch] = await db
      .select()
      .from(trainingChaptersTable)
      .where(eq(trainingChaptersTable.chapterId, req.params.chapterId))
      .limit(1);
    if (!ch) { res.status(404).json({ error: "Chapter not found" }); return; }
    res.json({ chapter: ch });
  }
);

// Upsert chapter content
router.put(
  "/admin/training/:chapterId",
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (req, res) => {
    const { title, subtitle, content } = req.body as {
      title: string;
      subtitle: string;
      content: unknown;
    };
    if (!title || !content) {
      res.status(400).json({ error: "title and content are required" });
      return;
    }

    const existing = await db
      .select({ id: trainingChaptersTable.id })
      .from(trainingChaptersTable)
      .where(eq(trainingChaptersTable.chapterId, req.params.chapterId))
      .limit(1);

    let ch;
    if (existing.length) {
      [ch] = await db
        .update(trainingChaptersTable)
        .set({ title, subtitle: subtitle ?? "", content: content as any, updatedAt: new Date() })
        .where(eq(trainingChaptersTable.chapterId, req.params.chapterId))
        .returning();
    } else {
      [ch] = await db
        .insert(trainingChaptersTable)
        .values({ chapterId: req.params.chapterId, title, subtitle: subtitle ?? "", content: content as any })
        .returning();
    }

    res.json({ chapter: ch });
  }
);

// Seed all chapters from static data (idempotent — skips chapters already in DB)
router.post(
  "/admin/training/seed",
  requireAuth,
  requireRoles(...ADMIN_ROLES),
  async (_req, res) => {
    let seeded = 0;
    for (const ch of CHAPTER_SEED) {
      const existing = await db
        .select({ id: trainingChaptersTable.id })
        .from(trainingChaptersTable)
        .where(eq(trainingChaptersTable.chapterId, ch.chapterId))
        .limit(1);

      if (!existing.length) {
        await db.insert(trainingChaptersTable).values({
          chapterId: ch.chapterId,
          title: ch.title,
          subtitle: ch.subtitle,
          content: ch.content as any,
        });
        seeded++;
      }
    }
    res.json({ ok: true, seeded, total: CHAPTER_SEED.length });
  }
);

// ─── Public Training Read (used by training page) ────────────────────────────

router.get("/training/chapters", async (_req, res) => {
  const chapters = await db
    .select({
      chapterId: trainingChaptersTable.chapterId,
      title: trainingChaptersTable.title,
      subtitle: trainingChaptersTable.subtitle,
    })
    .from(trainingChaptersTable)
    .orderBy(trainingChaptersTable.id);
  res.json({ chapters });
});

router.get("/training/chapters/:chapterId", async (req, res) => {
  const [ch] = await db
    .select()
    .from(trainingChaptersTable)
    .where(eq(trainingChaptersTable.chapterId, req.params.chapterId))
    .limit(1);
  if (!ch) { res.status(404).json({ error: "Chapter not found" }); return; }
  res.json({ chapter: ch });
});

export default router;
