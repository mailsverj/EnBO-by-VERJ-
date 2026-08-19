import { Router } from "express";
import { db } from "../lib/db.js";
import {
  assessmentQuestionsTable,
  assessmentAttemptsTable,
  assessmentDraftsTable,
  bdoApplicationsTable,
} from "@workspace/db/schema";
import { and, eq, count, sql } from "drizzle-orm";

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

function activeAttemptNumber(attemptCount: number): number {
  return attemptCount + 1;
}

function questionBankSignature(
  questions: { id: number; questionText: string; options: unknown }[],
): string {
  const source = questions
    .map(question => [
      question.id,
      question.questionText,
      quizOptions(question.options)
        .map(option => `${option.value}:${option.label}`)
        .join("|"),
    ].join("::"))
    .join("||");

  let hash = 5381;
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash * 33) ^ source.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

function sanitizeDraft(
  answers: unknown,
  currentQuestionId: unknown,
  questions: { id: number; options: unknown }[],
): { answers: Record<number, string>; currentQuestionId: number | null } {
  const cleanAnswers: Record<number, string> = {};
  const submittedAnswers = answers && typeof answers === "object" && !Array.isArray(answers)
    ? answers as Record<string, unknown>
    : {};

  for (const question of questions) {
    const submitted = submittedAnswers[String(question.id)];
    const optionValues = quizOptions(question.options).map(option => option.value);
    if (typeof submitted === "string" && optionValues.includes(submitted)) {
      cleanAnswers[question.id] = submitted;
    }
  }

  const parsedCurrentQuestionId = Number(currentQuestionId);
  return {
    answers: cleanAnswers,
    currentQuestionId: questions.some(question => question.id === parsedCurrentQuestionId)
      ? parsedCurrentQuestionId
      : null,
  };
}

// Public: get questions for a shortlisted applicant
router.get("/assessment/questions", async (req, res): Promise<void> => {
  const rawRef = Array.isArray(req.query.ref) ? req.query.ref[0] : req.query.ref;
  if (typeof rawRef !== "string" || !rawRef.trim()) {
    res.status(400).json({ error: "ref is required" });
    return;
  }
  const ref = rawRef.trim().toUpperCase();

  const outcome = await db.transaction(async tx => {
    const [foundApp] = await tx.select({
      id: bdoApplicationsTable.id,
    }).from(bdoApplicationsTable)
      .where(eq(bdoApplicationsTable.refId, ref))
      .limit(1);
    if (!foundApp) {
      return { status: 404, body: { error: "Application not found" } };
    }

    await tx.execute(sql`select pg_advisory_xact_lock(${foundApp.id})`);
    const [app] = await tx.select({
      id: bdoApplicationsTable.id,
      status: bdoApplicationsTable.status,
      assessmentStatus: bdoApplicationsTable.assessmentStatus,
      fullName: bdoApplicationsTable.fullName,
    }).from(bdoApplicationsTable)
      .where(eq(bdoApplicationsTable.id, foundApp.id))
      .limit(1);
    if (!app) {
      return { status: 404, body: { error: "Application not found" } };
    }
    if (app.assessmentStatus === "Passed") {
      return {
        status: 403,
        body: {
          error: "You have already passed this assessment. Well done!",
          assessmentStatus: "Passed",
        },
      };
    }

    const [{ attemptCount }] = await tx.select({ attemptCount: count() })
      .from(assessmentAttemptsTable)
      .where(eq(assessmentAttemptsTable.appId, app.id));
    if (Number(attemptCount) >= MAX_ATTEMPTS) {
      return {
        status: 403,
        body: {
          error: "You have used all your attempts. Please contact VERJ SOLAR if you wish to request another opportunity.",
          assessmentStatus: "Failed",
          locked: true,
        },
      };
    }
    if (app.status !== "Shortlisted") {
      return {
        status: 403,
        body: {
          error: "Assessment is not available yet. Please wait for your shortlisting confirmation.",
        },
      };
    }

    const questions = await tx.select({
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
    const totalMarks = quizQuestions.reduce((sum, question) => sum + (question.marks ?? 3), 0);
    const attemptNumber = activeAttemptNumber(Number(attemptCount));
    const currentQuestionBankSignature = questionBankSignature(questions);
    const [draft] = await tx.select({
      id: assessmentDraftsTable.id,
      answers: assessmentDraftsTable.answers,
      currentQuestionId: assessmentDraftsTable.currentQuestionId,
      revision: assessmentDraftsTable.revision,
      questionBankSignature: assessmentDraftsTable.questionBankSignature,
      updatedAt: assessmentDraftsTable.updatedAt,
    }).from(assessmentDraftsTable).where(and(
      eq(assessmentDraftsTable.appId, app.id),
      eq(assessmentDraftsTable.attemptNumber, attemptNumber),
    )).limit(1);
    const safeDraft = draft?.questionBankSignature === currentQuestionBankSignature
      ? {
        ...sanitizeDraft(draft.answers, draft.currentQuestionId, questions),
        revision: draft.revision,
        savedAt: draft.updatedAt.toISOString(),
      }
      : null;
    if (draft && !safeDraft) {
      await tx.delete(assessmentDraftsTable)
        .where(eq(assessmentDraftsTable.id, draft.id));
    }

    return {
      status: 200,
      body: {
        questions: quizQuestions,
        applicantName: app.fullName,
        total: questions.length,
        totalMarks,
        attemptNumber,
        attemptsRemaining: MAX_ATTEMPTS - Number(attemptCount),
        draft: safeDraft,
      },
    };
  });

  res.status(outcome.status).json(outcome.body);
});

// Public: save an unfinished assessment. Saving does not create an attempt.
router.put("/assessment/draft", async (req, res): Promise<void> => {
  const { ref, attemptNumber, revision, answers, currentQuestionId } = req.body as {
    ref?: unknown;
    attemptNumber?: unknown;
    revision?: unknown;
    answers?: unknown;
    currentQuestionId?: unknown;
  };
  if (
    typeof ref !== "string"
    || !ref.trim()
    || !Number.isInteger(attemptNumber)
    || Number(attemptNumber) < 1
    || !Number.isInteger(revision)
    || Number(revision) < 0
  ) {
    res.status(400).json({ error: "ref, attemptNumber, and revision are required" });
    return;
  }

  const outcome = await db.transaction(async tx => {
    const [foundApp] = await tx.select({
      id: bdoApplicationsTable.id,
    }).from(bdoApplicationsTable)
      .where(eq(bdoApplicationsTable.refId, ref.trim().toUpperCase()))
      .limit(1);
    if (!foundApp) {
      return { status: 404, body: { error: "Application not found" } };
    }

    await tx.execute(sql`select pg_advisory_xact_lock(${foundApp.id})`);
    const [app] = await tx.select({
      id: bdoApplicationsTable.id,
      status: bdoApplicationsTable.status,
      assessmentStatus: bdoApplicationsTable.assessmentStatus,
    }).from(bdoApplicationsTable).where(eq(bdoApplicationsTable.id, foundApp.id)).limit(1);
    if (!app || app.status !== "Shortlisted" || app.assessmentStatus === "Passed") {
      return { status: 403, body: { error: "Assessment is not available" } };
    }

    const [{ attemptCount }] = await tx.select({ attemptCount: count() })
      .from(assessmentAttemptsTable).where(eq(assessmentAttemptsTable.appId, app.id));
    if (Number(attemptCount) >= MAX_ATTEMPTS) {
      return { status: 409, body: { error: "All attempts exhausted", locked: true } };
    }

    const activeAttempt = activeAttemptNumber(Number(attemptCount));
    if (Number(attemptNumber) !== activeAttempt) {
      return {
        status: 409,
        body: { error: "This assessment attempt is no longer active", staleAttempt: true },
      };
    }

    const questions = await tx.select({
      id: assessmentQuestionsTable.id,
      questionText: assessmentQuestionsTable.questionText,
      options: assessmentQuestionsTable.options,
    }).from(assessmentQuestionsTable)
      .where(eq(assessmentQuestionsTable.active, true))
      .orderBy(assessmentQuestionsTable.id);
    const safeDraft = sanitizeDraft(answers, currentQuestionId, questions);
    const currentQuestionBankSignature = questionBankSignature(questions);
    const [currentDraft] = await tx.select({
      id: assessmentDraftsTable.id,
      revision: assessmentDraftsTable.revision,
    }).from(assessmentDraftsTable).where(and(
      eq(assessmentDraftsTable.appId, app.id),
      eq(assessmentDraftsTable.attemptNumber, activeAttempt),
    )).limit(1);
    const currentRevision = currentDraft?.revision ?? 0;
    if (Number(revision) !== currentRevision) {
      return {
        status: 409,
        body: {
          error: "This draft was updated on another device",
          conflict: true,
          revision: currentRevision,
        },
      };
    }

    const nextRevision = currentRevision + 1;
    const updatedAt = new Date();
    if (currentDraft) {
      await tx.update(assessmentDraftsTable).set({
        ...safeDraft,
        revision: nextRevision,
        questionBankSignature: currentQuestionBankSignature,
        updatedAt,
      }).where(eq(assessmentDraftsTable.id, currentDraft.id));
    } else {
      await tx.insert(assessmentDraftsTable).values({
        appId: app.id,
        attemptNumber: activeAttempt,
        revision: nextRevision,
        questionBankSignature: currentQuestionBankSignature,
        ...safeDraft,
        updatedAt,
      });
    }

    return {
      status: 200,
      body: { ok: true, ...safeDraft, revision: nextRevision, savedAt: updatedAt.toISOString() },
    };
  });

  res.status(outcome.status).json(outcome.body);
});

// Public: submit assessment answers
router.post("/assessment/submit", async (req, res): Promise<void> => {
  const { ref, attemptNumber, answers } = req.body as {
    ref?: unknown;
    attemptNumber?: unknown;
    answers?: unknown;
  };

  if (
    typeof ref !== "string"
    || !ref.trim()
    || !Number.isInteger(attemptNumber)
    || Number(attemptNumber) < 1
    || !answers
    || typeof answers !== "object"
    || Array.isArray(answers)
  ) {
    res.status(400).json({ error: "ref, attemptNumber, and answers are required" });
    return;
  }

  const outcome = await db.transaction(async tx => {
    const [foundApp] = await tx.select({
      id: bdoApplicationsTable.id,
    }).from(bdoApplicationsTable)
      .where(eq(bdoApplicationsTable.refId, ref.trim().toUpperCase()))
      .limit(1);
    if (!foundApp) {
      return { status: 404, body: { error: "Application not found" } };
    }

    await tx.execute(sql`select pg_advisory_xact_lock(${foundApp.id})`);
    const [app] = await tx.select().from(bdoApplicationsTable)
      .where(eq(bdoApplicationsTable.id, foundApp.id)).limit(1);
    if (!app) {
      return { status: 404, body: { error: "Application not found" } };
    }
    if (app.assessmentStatus === "Passed") {
      return {
        status: 409,
        body: { error: "Assessment already passed", assessmentStatus: "Passed" },
      };
    }
    if (app.status !== "Shortlisted") {
      return { status: 403, body: { error: "Assessment not available" } };
    }

    const [{ attemptCount }] = await tx.select({ attemptCount: count() })
      .from(assessmentAttemptsTable)
      .where(eq(assessmentAttemptsTable.appId, app.id));
    if (Number(attemptCount) >= MAX_ATTEMPTS) {
      return {
        status: 409,
        body: { error: "All attempts exhausted", assessmentStatus: "Failed", locked: true },
      };
    }

    const currentAttempt = activeAttemptNumber(Number(attemptCount));
    if (Number(attemptNumber) !== currentAttempt) {
      return {
        status: 409,
        body: { error: "This assessment attempt is no longer active", staleAttempt: true },
      };
    }

    const questions = await tx.select().from(assessmentQuestionsTable)
      .where(eq(assessmentQuestionsTable.active, true))
      .orderBy(assessmentQuestionsTable.id);
    const safeAnswers = sanitizeDraft(answers, null, questions).answers;
    let score = 0;
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks ?? 3), 0);
    for (const question of questions) {
      const submitted = safeAnswers[question.id];
      const correctIdx = correctOptionIndex(question.correctOption);
      if (submitted !== undefined && Number(submitted) === correctIdx) {
        score += (question.marks ?? 3);
      }
    }

    const passed = totalMarks > 0 && score / totalMarks >= PASS_PERCENT;
    const isFinalAttempt = currentAttempt >= MAX_ATTEMPTS;
    const assessmentStatus = passed ? "Passed" : (isFinalAttempt ? "Failed" : "Failed Attempt 1");
    const newAppStatus = passed ? "Assessment Passed" : (isFinalAttempt ? "Assessment Failed" : "Shortlisted");

    await tx.insert(assessmentAttemptsTable).values({
      appId: app.id,
      appRef: app.refId,
      answers: safeAnswers,
      score,
      total: totalMarks,
      passed,
    });
    await tx.update(bdoApplicationsTable).set({
      assessmentStatus,
      assessmentScore: score,
      assessmentTotal: totalMarks,
      assessmentPassed: passed,
      assessmentCompletedAt: new Date(),
      status: newAppStatus,
      updatedAt: new Date(),
    }).where(eq(bdoApplicationsTable.id, app.id));
    await tx.delete(assessmentDraftsTable)
      .where(eq(assessmentDraftsTable.appId, app.id));

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - currentAttempt);
    return {
      status: 200,
      body: {
        ok: true,
        score,
        totalMarks,
        passed,
        assessmentStatus,
        percentage,
        attemptsUsed: currentAttempt,
        attemptsRemaining,
        locked: !passed && isFinalAttempt,
      },
    };
  });

  res.status(outcome.status).json(outcome.body);
});

export default router;
