import { Router } from "express";
import { db } from "../lib/db.js";
import { broadcastsTable, broadcastReadsTable } from "@workspace/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAuth, requireRoles } from "../middleware/auth.js";

const router = Router();

// GET /api/broadcasts — list all broadcasts (for current user, with read status)
router.get("/broadcasts", requireAuth, async (req, res) => {
  const userId = (req as any).session.userId as number;
  const broadcasts = await db
    .select({
      id: broadcastsTable.id,
      title: broadcastsTable.title,
      message: broadcastsTable.message,
      targetRoles: broadcastsTable.targetRoles,
      sentByName: broadcastsTable.sentByName,
      createdAt: broadcastsTable.createdAt,
      readAt: broadcastReadsTable.readAt,
    })
    .from(broadcastsTable)
    .leftJoin(
      broadcastReadsTable,
      and(
        eq(broadcastReadsTable.broadcastId, broadcastsTable.id),
        eq(broadcastReadsTable.userId, userId)
      )
    )
    .orderBy(desc(broadcastsTable.createdAt));

  res.json({ broadcasts });
});

// GET /api/broadcasts/unread-count
router.get("/broadcasts/unread-count", requireAuth, async (req, res) => {
  const userId = (req as any).session.userId as number;
  const all = await db.select({ id: broadcastsTable.id }).from(broadcastsTable);
  const read = await db.select({ broadcastId: broadcastReadsTable.broadcastId })
    .from(broadcastReadsTable)
    .where(eq(broadcastReadsTable.userId, userId));
  const readIds = new Set(read.map(r => r.broadcastId));
  const unread = all.filter(b => !readIds.has(b.id)).length;
  res.json({ unread });
});

// POST /api/broadcasts — send broadcast (admins only)
router.post("/broadcasts", requireAuth, requireRoles(["Super Admin", "Chief Admin", "Management"]), async (req, res) => {
  const { title, message, targetRoles } = req.body as { title: string; message: string; targetRoles: string };
  const session = (req as any).session;
  if (!title?.trim() || !message?.trim()) {
    res.status(400).json({ error: "Title and message are required" }); return;
  }
  const [broadcast] = await db.insert(broadcastsTable).values({
    title: title.trim(),
    message: message.trim(),
    targetRoles: targetRoles ?? "all",
    sentBy: session.userId,
    sentByName: session.userName,
  }).returning();
  res.json({ ok: true, broadcast });
});

// PATCH /api/broadcasts/:id/read — mark as read
router.patch("/broadcasts/:id/read", requireAuth, async (req, res) => {
  const userId = (req as any).session.userId as number;
  const broadcastId = parseInt(req.params.id);
  await db
    .insert(broadcastReadsTable)
    .values({ broadcastId, userId })
    .onConflictDoNothing();
  res.json({ ok: true });
});

// PATCH /api/broadcasts/read-all — mark all as read
router.patch("/broadcasts/read-all", requireAuth, async (req, res) => {
  const userId = (req as any).session.userId as number;
  const all = await db.select({ id: broadcastsTable.id }).from(broadcastsTable);
  for (const b of all) {
    await db.insert(broadcastReadsTable)
      .values({ broadcastId: b.id, userId })
      .onConflictDoNothing();
  }
  res.json({ ok: true });
});

// DELETE /api/broadcasts/:id — delete (admins only)
router.delete("/broadcasts/:id", requireAuth, requireRoles(["Super Admin", "Chief Admin"]), async (req, res) => {
  await db.delete(broadcastsTable).where(eq(broadcastsTable.id, parseInt(req.params.id)));
  res.json({ ok: true });
});

export default router;
