import { Router } from "express";
import { db } from "../lib/db.js";
import { bdoApplicationsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

declare module "express-session" {
  interface SessionData {
    onboardingApp?: {
      id: number;
      refId: string;
      fullName: string;
      email: string;
      status: string;
      assessmentStatus: string;
      assessmentScore: number | null;
      assessmentTotal: number | null;
      assessmentPassed: boolean | null;
    };
  }
}

const router = Router();

// Public: portal login
router.post("/onboard/login", async (req, res) => {
  const { refId, password } = req.body as { refId?: string; password?: string };

  if (!refId || !password) {
    res.status(400).json({ error: "Application ID and password are required" });
    return;
  }

  const [app] = await db
    .select()
    .from(bdoApplicationsTable)
    .where(eq(bdoApplicationsTable.refId, refId.trim().toUpperCase()))
    .limit(1);

  if (!app) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  // Only allow portal access for applicants who are shortlisted or passed assessment
  const allowedStatuses = ["Shortlisted", "Assessment Passed"];
  if (!allowedStatuses.includes(app.status)) {
    if (app.status === "Activated") {
      res.status(403).json({
        error: "Your BDO account has been activated. Please use the main EnBO login instead.",
        redirectToLogin: true,
      });
    } else if (app.status === "Assessment Failed") {
      res.status(403).json({
        error: "Your assessment access has been locked. Please contact mails.verj@gmail.com.",
        locked: true,
      });
    } else {
      res.status(403).json({
        error: "The onboarding portal is not yet available for your application. Please wait for your shortlisting confirmation.",
      });
    }
    return;
  }

  if (!app.onboardingPasswordHash) {
    res.status(403).json({
      error: "Your portal credentials have not been set up yet. Please contact mails.verj@gmail.com.",
    });
    return;
  }

  const valid = await bcrypt.compare(password, app.onboardingPasswordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  // Store onboarding session
  req.session.onboardingApp = {
    id: app.id,
    refId: app.refId,
    fullName: app.fullName,
    email: app.email,
    status: app.status,
    assessmentStatus: app.assessmentStatus,
    assessmentScore: app.assessmentScore,
    assessmentTotal: app.assessmentTotal,
    assessmentPassed: app.assessmentPassed,
  };

  res.json({
    ok: true,
    app: req.session.onboardingApp,
  });
});

// Get current onboarding session — re-fetches live status from DB
router.get("/onboard/me", async (req, res) => {
  if (!req.session.onboardingApp) {
    res.status(401).json({ error: "Not logged in to onboarding portal" });
    return;
  }

  // Re-fetch fresh status
  const [app] = await db
    .select({
      id: bdoApplicationsTable.id,
      refId: bdoApplicationsTable.refId,
      fullName: bdoApplicationsTable.fullName,
      email: bdoApplicationsTable.email,
      status: bdoApplicationsTable.status,
      assessmentStatus: bdoApplicationsTable.assessmentStatus,
      assessmentScore: bdoApplicationsTable.assessmentScore,
      assessmentTotal: bdoApplicationsTable.assessmentTotal,
      assessmentPassed: bdoApplicationsTable.assessmentPassed,
    })
    .from(bdoApplicationsTable)
    .where(eq(bdoApplicationsTable.id, req.session.onboardingApp.id))
    .limit(1);

  if (!app) {
    res.status(401).json({ error: "Application not found" });
    return;
  }

  // Update session with fresh data
  req.session.onboardingApp = app;

  res.json({ app });
});

// Logout from onboarding portal
router.post("/onboard/logout", (req, res) => {
  delete req.session.onboardingApp;
  res.json({ ok: true });
});

export default router;
