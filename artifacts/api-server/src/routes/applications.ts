import { Router } from "express";
import { db } from "../lib/db.js";
import { bdoApplicationsTable, bdosTable, usersTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import bcrypt from "bcryptjs";

const router = Router();

// Public: submit application from /apply form
router.post("/applications", async (req, res) => {
  const body = req.body as Record<string, string>;

  const existing = await db.select({ refId: bdoApplicationsTable.refId }).from(bdoApplicationsTable).orderBy(desc(bdoApplicationsTable.id)).limit(1);
  const lastNum = existing[0] ? parseInt(existing[0].refId.replace("APP-", ""), 10) : 0;
  const refId = `APP-${String(lastNum + 1).padStart(3, "0")}`;

  const [app] = await db.insert(bdoApplicationsTable).values({
    refId,
    // Step 1 — Personal
    title: body.title,
    fullName: body.fullName ?? "",
    email: body.email ?? "",
    phone: body.phone ?? "",
    whatsappNumber: body.whatsappNumber,
    dob: body.dob,
    address: body.address,
    // Step 2 — Business & Experience
    coverageAreas: body.coverageAreas,
    hasOffice: body.hasOffice,
    officeAddress: body.officeAddress,
    officeCurrentUse: body.officeCurrentUse,
    wantsVerjSticker: body.wantsVerjSticker,
    occupation: body.occupation,
    employerName: body.employerName,
    education: body.education,
    hasSalesExperience: body.hasSalesExperience,
    previousSalesDetail: body.previousSalesDetail,
    salesExperience: body.salesExperience,
    // Step 3 — KYC & Declaration
    referralSource: body.referralSource,
    photoUrl: body.photoUrl,
    idDocumentUrl: body.idDocumentUrl,
    statement: body.statement,
    // Step 4 — Banking
    bankName: body.bankName,
    accountNumber: body.accountNumber,
    accountName: body.accountName,
    // System defaults
    status: "Submitted",
    kycStatus: "Not Started",
    assessmentStatus: "Not Started",
  }).returning();

  res.status(201).json({ ok: true, refId: app.refId });
});

// Admin: list all applications
router.get("/applications", requireAuth, requireRoles("Chief Admin", "Super Admin", "Recruitment/Admin", "Management"), async (_req, res) => {
  const apps = await db.select().from(bdoApplicationsTable).orderBy(desc(bdoApplicationsTable.createdAt));
  res.json({ applications: apps });
});

// Admin: get single application
router.get("/applications/:id", requireAuth, requireRoles("Chief Admin", "Super Admin", "Recruitment/Admin", "Management"), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const [app] = await db.select().from(bdoApplicationsTable).where(eq(bdoApplicationsTable.id, id)).limit(1);
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ application: app });
});

// Admin: update application (general patch)
router.patch("/applications/:id", requireAuth, requireRoles("Chief Admin", "Super Admin", "Recruitment/Admin", "Management"), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const body = req.body as Record<string, string>;

  // Fetch current application to check activation status
  const [current] = await db.select({ status: bdoApplicationsTable.status })
    .from(bdoApplicationsTable).where(eq(bdoApplicationsTable.id, id)).limit(1);
  if (!current) { res.status(404).json({ error: "Not found" }); return; }

  // Protect banking fields once activated
  const BANKING_FIELDS = ["bankName", "accountNumber", "accountName"];
  if (current.status === "Activated") {
    const attempted = BANKING_FIELDS.filter(f => body[f] !== undefined);
    if (attempted.length > 0) {
      res.status(403).json({
        error: "Banking details are locked after activation and cannot be changed. Contact the Finance team to request an update.",
        lockedFields: attempted,
      });
      return;
    }
  }

  const { status, adminNotes, assignedEngineerId, generatedUsername } = body;
  const updateData: Partial<typeof bdoApplicationsTable.$inferInsert> = { updatedAt: new Date() };
  if (status) updateData.status = status;
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
  if (assignedEngineerId) updateData.assignedEngineerId = assignedEngineerId;
  if (generatedUsername) updateData.generatedUsername = generatedUsername;

  const [updated] = await db.update(bdoApplicationsTable).set(updateData).where(eq(bdoApplicationsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ application: updated });
});

// Admin: update KYC status
router.patch("/applications/:id/kyc", requireAuth, requireRoles("Chief Admin", "Super Admin", "Recruitment/Admin", "Management"), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { kycStatus, adminNotes } = req.body as { kycStatus: string; adminNotes?: string };

  if (!["KYC Pending", "KYC Verified", "KYC Resubmission Required"].includes(kycStatus)) {
    res.status(400).json({ error: "Invalid kycStatus" }); return;
  }

  // Map KYC status to overall status
  let newStatus: string | undefined;
  if (kycStatus === "KYC Pending") newStatus = "KYC Pending";
  if (kycStatus === "KYC Resubmission Required") newStatus = "KYC Resubmission Required";
  // KYC Verified stays as-is (shortlisting is a separate action)

  const updateData: Partial<typeof bdoApplicationsTable.$inferInsert> = {
    kycStatus,
    updatedAt: new Date(),
  };
  if (newStatus) updateData.status = newStatus;
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

  const [updated] = await db.update(bdoApplicationsTable).set(updateData).where(eq(bdoApplicationsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ application: updated });
});

// Admin: shortlist applicant (after KYC verified)
router.patch("/applications/:id/shortlist", requireAuth, requireRoles("Chief Admin", "Super Admin", "Recruitment/Admin", "Management"), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const [app] = await db.select().from(bdoApplicationsTable).where(eq(bdoApplicationsTable.id, id)).limit(1);
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  if (app.kycStatus !== "KYC Verified") {
    res.status(400).json({ error: "KYC must be verified before shortlisting" }); return;
  }

  const [updated] = await db.update(bdoApplicationsTable).set({
    status: "Shortlisted",
    shortlistedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(bdoApplicationsTable.id, id)).returning();

  res.json({ application: updated });
});

// Chief Admin: activate BDO (creates user + BDO records)
router.patch("/applications/:id/activate", requireAuth, requireRoles("Chief Admin"), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const [app] = await db.select().from(bdoApplicationsTable).where(eq(bdoApplicationsTable.id, id)).limit(1);
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  if (app.assessmentStatus !== "Passed") {
    res.status(400).json({ error: "Applicant must pass the assessment before activation" }); return;
  }
  if (app.status === "Activated") {
    res.status(409).json({ error: "Already activated" }); return;
  }

  // Generate VBDO ID
  const existingBdos = await db.select({ vbdoId: bdosTable.vbdoId }).from(bdosTable).orderBy(desc(bdosTable.id)).limit(1);
  const lastBdoNum = existingBdos[0] ? parseInt(existingBdos[0].vbdoId.replace("VBDO-", ""), 10) : 0;
  const vbdoId = `VBDO-${String(lastBdoNum + 1).padStart(4, "0")}`;

  // Generate credentials
  const defaultPassword = `VERJ@${new Date().getFullYear()}`;
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // Create user account (login = email, username = VBDO ID)
  const [user] = await db.insert(usersTable).values({
    email: app.email,
    passwordHash,
    name: app.fullName,
    roles: ["BDO"],
    vbdoId,
  }).onConflictDoNothing().returning();

  const userId = user?.id;

  // Create BDO record
  await db.insert(bdosTable).values({
    vbdoId,
    userId: userId ?? null,
    name: app.fullName,
    email: app.email,
    phone: app.phone ?? null,
    location: app.state ?? null,
    status: "Active",
    leadsCount: 0,
    totalValue: 0,
  }).onConflictDoNothing();

  // Update application
  const [updated] = await db.update(bdoApplicationsTable).set({
    status: "Activated",
    generatedUsername: vbdoId,
    activatedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(bdoApplicationsTable.id, id)).returning();

  res.json({
    application: updated,
    credentials: { vbdoId, username: vbdoId, defaultPassword, email: app.email },
  });
});

// Admin: reject application
router.patch("/applications/:id/reject", requireAuth, requireRoles("Chief Admin", "Super Admin", "Recruitment/Admin", "Management"), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { reason } = req.body as { reason?: string };

  const [updated] = await db.update(bdoApplicationsTable).set({
    status: "Rejected",
    adminNotes: reason ?? null,
    updatedAt: new Date(),
  }).where(eq(bdoApplicationsTable.id, id)).returning();

  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ application: updated });
});

export default router;
