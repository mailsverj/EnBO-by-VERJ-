import { Router } from "express";
import { db } from "../lib/db.js";
import {
  assessmentQuestionsTable,
  assessmentAttemptsTable,
  bdoApplicationsTable,
} from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();
const PASS_SCORE = 0.7; // 70% to pass

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
  if (app.assessmentStatus === "Passed" || app.assessmentStatus === "Failed") {
    res.status(403).json({ error: "You have already completed this assessment.", assessmentStatus: app.assessmentStatus });
    return;
  }

  const questions = await db.select({
    id: assessmentQuestionsTable.id,
    category: assessmentQuestionsTable.category,
    questionText: assessmentQuestionsTable.questionText,
    options: assessmentQuestionsTable.options,
    points: assessmentQuestionsTable.points,
    // correctOption intentionally excluded — not sent to client
  }).from(assessmentQuestionsTable)
    .where(eq(assessmentQuestionsTable.active, true))
    .orderBy(assessmentQuestionsTable.id);

  res.json({ questions, applicantName: app.fullName, total: questions.length });
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
  if (app.assessmentStatus === "Passed" || app.assessmentStatus === "Failed") {
    res.status(409).json({ error: "Assessment already completed", assessmentStatus: app.assessmentStatus }); return;
  }

  // Fetch all active questions with correct answers
  const questions = await db.select().from(assessmentQuestionsTable)
    .where(eq(assessmentQuestionsTable.active, true))
    .orderBy(assessmentQuestionsTable.id);

  let score = 0;
  const total = questions.reduce((sum, q) => sum + q.points, 0);

  for (const q of questions) {
    const submitted = answers[q.id];
    if (submitted === q.correctOption) {
      score += q.points;
    }
  }

  const passed = score / total >= PASS_SCORE;
  const assessmentStatus = passed ? "Passed" : "Failed";
  const newStatus = passed ? "Assessment Passed" : "Assessment Failed";

  // Record attempt
  await db.insert(assessmentAttemptsTable).values({
    appId: app.id,
    appRef: app.refId,
    answers: answers,
    score,
    total,
    passed,
  });

  // Update application
  await db.update(bdoApplicationsTable).set({
    assessmentStatus,
    assessmentScore: score,
    assessmentTotal: total,
    assessmentPassed: passed,
    assessmentCompletedAt: new Date(),
    status: newStatus,
    updatedAt: new Date(),
  }).where(eq(bdoApplicationsTable.id, app.id));

  res.json({ ok: true, score, total, passed, assessmentStatus, percentage: Math.round((score / total) * 100) });
});

export default router;
