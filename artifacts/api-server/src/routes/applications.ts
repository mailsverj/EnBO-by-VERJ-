import { Router } from "express";
import { db } from "../lib/db.js";
import { bdoApplicationsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireRoles } from "../middleware/auth.js";

const router = Router();

// Public: submit application from /apply form
router.post("/applications", async (req, res) => {
  const body = req.body as Record<string, string>;

  // Generate ref ID
  const existing = await db.select({ refId: bdoApplicationsTable.refId }).from(bdoApplicationsTable).orderBy(desc(bdoApplicationsTable.id)).limit(1);
  const lastNum = existing[0] ? parseInt(existing[0].refId.replace("APP-", ""), 10) : 0;
  const refId = `APP-${String(lastNum + 1).padStart(3, "0")}`;

  const [app] = await db.insert(bdoApplicationsTable).values({
    refId,
    fullName: body.fullName ?? "",
    email: body.email ?? "",
    phone: body.phone ?? "",
    gender: body.gender,
    dob: body.dob,
    state: body.state,
    lga: body.lga,
    address: body.address,
    nin: body.nin,
    bvn: body.bvn,
    bankName: body.bankName,
    accountNumber: body.accountNumber,
    accountName: body.accountName,
    guarantorName: body.guarantorName,
    guarantorPhone: body.guarantorPhone,
    guarantorRelationship: body.guarantorRelationship,
    guarantorAddress: body.guarantorAddress,
    referralSource: body.referralSource,
    salesExperience: body.salesExperience,
    statement: body.statement,
    status: "Submitted",
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

// Admin: update application status
router.patch("/applications/:id", requireAuth, requireRoles("Chief Admin", "Super Admin", "Recruitment/Admin", "Management"), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status, adminNotes, assignedEngineerId, generatedUsername } = req.body as Record<string, string>;

  const updateData: Partial<typeof bdoApplicationsTable.$inferInsert> = { updatedAt: new Date() };
  if (status) updateData.status = status;
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
  if (assignedEngineerId) updateData.assignedEngineerId = assignedEngineerId;
  if (generatedUsername) updateData.generatedUsername = generatedUsername;
  if (status === "Activated") updateData.activatedAt = new Date();

  const [updated] = await db.update(bdoApplicationsTable).set(updateData).where(eq(bdoApplicationsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ application: updated });
});

export default router;
