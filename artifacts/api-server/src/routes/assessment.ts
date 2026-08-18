import { Router } from "express";
import { db } from "../lib/db.js";
import {
  assessmentQuestionsTable,
  assessmentAttemptsTable,
  bdoApplicationsTable,
} from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";

const router = Router();
const PASS_PERCENT = 0.7; // 70% to pass
const MAX_ATTEMPTS = 2;
const OPTION_KEYS = ["a", "b", "c", "d"];

/**
 * Supports the original seeded `string[]` choices and the structured choices
 * created in the content editor. The public quiz always receives a stable
 * numeric answer value, which matches the stored correct-answer index.
 */
function quizOptions(options: unknown): { label: string; value: string }[] {
  if (!Array.isArray(options)) return [];
  return options.map((option, index) => ({
    label: typeof option === "string"
      ? option
      : String((option as { label?: unknown; value?: unknown })?.label
        ?? (option as { value?: unknown })?.value
        ?? ""),
    value: String(index),
  })).filter(option => option.label.trim().length > 0);
}

function correctOptionIndex(correctOption: string | null): number {
  const numeric = Number(correctOption);
  if (Number.isInteger(numeric) && numeric >= 0) return numeric;
  const letterIndex = OPTION_KEYS.indexOf((correctOption ?? "").toLowerCase());
  return letterIndex >= 0 ? letterIndex : 0;
}

// Public: get questions for a shortlisted applicant
router.get("/assessment/questions", async (req, res) => {
  const ref = (req.query.ref as string)?.toUpperCase();
  if (!ref) { res.status(400).json({ error: "ref is required" }); return; }

  const [app] = await db.select({
    id: bdoApplicationsTable.id,
    status: bdoApplicationsTable.status,
    assessmentStatus: bdoApplicationsTable.assessmentStatus,
    fullName: bdoApplicationsTable.fullName,
  }).from(bdoApplicationsTable).where(eq(bdoApplicationsTable.refId, ref)).limit(1);

  if (!app) { res.status(404).json({ error: "Application not found" }); return; }
  if (app.status !== "Shortlisted") {
    res.status(403).json({ error: "Assessment is not available yet. Please wait for your shortlisting confirmation." });
    return;
  }

  // Check attempt count
  const [{ attemptCount }] = await db
    .select({ attemptCount: count() })
    .from(assessmentAttemptsTable)
    .where(eq(assessmentAttemptsTable.appId, app.id));

  if (app.assessmentStatus === "Passed") {
    res.status(403).json({ error: "You have already passed this assessment. Well done!", assessmentStatus: "Passed" });
    return;
  }
  if (Number(attemptCount) >= MAX_ATTEMPTS && app.assessmentStatus === "Failed") {
    res.status(403).json({
      error: "You have used all your attempts. Please contact VERJ SOLAR if you wish to request another opportunity.",
      assessmentStatus: "Failed",
      locked: true,
    });
    return;
  }

  const questions = await db.select({
    id: assessmentQuestionsTable.id,
    category: assessmentQuestionsTable.category,
    questionText: assessmentQuestionsTable.questionText,
    options: assessmentQuestionsTable.options,
    marks: assessmentQuestionsTable.marks,
    // correctOption intentionally excluded — never sent to client
  }).from(assessmentQuestionsTable)
    .where(eq(assessmentQuestionsTable.active, true))
    .orderBy(assessmentQuestionsTable.id);

  const quizQuestions = questions.map(question => ({
    ...question,
    options: quizOptions(question.options),
  }));
  const totalMarks = quizQuestions.reduce((sum, q) => sum + (q.marks ?? 3), 0);

  res.json({
    questions: quizQuestions,
    applicantName: app.fullName,
    total: questions.length,
    totalMarks,
    attemptNumber: Number(attemptCount) + 1,
    attemptsRemaining: MAX_ATTEMPTS - Number(attemptCount),
  });
});

// Public: submit assessment answers
router.post("/assessment/submit", async (req, res) => {
  const { ref, answers } = req.body as { ref: string; answers: Record<number, string> };

  if (!ref || !answers) { res.status(400).json({ error: "ref and answers are required" }); return; }

  const [app] = await db.select().from(bdoApplicationsTable)
    .where(eq(bdoApplicationsTable.refId, ref.toUpperCase())).limit(1);

  if (!app) { res.status(404).json({ error: "Application not found" }); return; }
  if (app.status !== "Shortlisted") {
    res.status(403).json({ error: "Assessment not available" }); return;
  }
  if (app.assessmentStatus === "Passed") {
    res.status(409).json({ error: "Assessment already passed", assessmentStatus: "Passed" }); return;
  }

  // Count existing attempts
  const [{ attemptCount }] = await db
    .select({ attemptCount: count() })
    .from(assessmentAttemptsTable)
    .where(eq(assessmentAttemptsTable.appId, app.id));

  if (Number(attemptCount) >= MAX_ATTEMPTS) {
    res.status(409).json({ error: "All attempts exhausted", assessmentStatus: "Failed", locked: true }); return;
  }

  const currentAttempt = Number(attemptCount) + 1;

  // Fetch all active questions with correct answers
  const questions = await db.select().from(assessmentQuestionsTable)
    .where(eq(assessmentQuestionsTable.active, true))
    .orderBy(assessmentQuestionsTable.id);

  let score = 0;
  const totalMarks = questions.reduce((sum, q) => sum + (q.marks ?? 3), 0);

  for (const q of questions) {
    const submitted = answers[q.id];
    const correctIdx = correctOptionIndex(q.correctOption);
    if (submitted !== undefined && Number(submitted) === correctIdx) {
      score += (q.marks ?? 3);
    }
  }

  const passed = score / totalMarks >= PASS_PERCENT;
  const isFinalAttempt = currentAttempt >= MAX_ATTEMPTS;
  const assessmentStatus = passed ? "Passed" : (isFinalAttempt ? "Failed" : "Failed Attempt 1");
  const newAppStatus = passed ? "Assessment Passed" : (isFinalAttempt ? "Assessment Failed" : "Shortlisted");

  // Record attempt
  await db.insert(assessmentAttemptsTable).values({
    appId: app.id,
    appRef: app.refId,
    answers,
    score,
    total: totalMarks,
    passed,
  });

  // Update application
  await db.update(bdoApplicationsTable).set({
    assessmentStatus,
    assessmentScore: score,
    assessmentTotal: totalMarks,
    assessmentPassed: passed,
    assessmentCompletedAt: new Date(),
    status: newAppStatus,
    updatedAt: new Date(),
  }).where(eq(bdoApplicationsTable.id, app.id));

  const percentage = Math.round((score / totalMarks) * 100);
  const attemptsUsed = currentAttempt;
  const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - attemptsUsed);

  res.json({
    ok: true, score, totalMarks, passed, assessmentStatus,
    percentage, attemptsUsed, attemptsRemaining,
    locked: !passed && isFinalAttempt,
  });
});

export default router;
